// Copyright (c) <current_year>, The PerformanC Organization
// This is the modded version of PWSL (typescript variant) for running on Rainlink
// Source code get from PerformanC/Internals#PWSL
// Special thanks to all members of PerformanC Organization
// Link: https://github.com/PerformanC/internals/tree/fbc73f6368a6971835683f4b22bb4e3b15fa0b73
// Github repo link: https://github.com/PerformanC/internals
// PWSL's LICENSE: https://github.com/PerformanC/internals/blob/fbc73f6368a6971835683f4b22bb4e3b15fa0b73/LICENSE

import https from "node:https";
import http from "node:http";
import crypto from "node:crypto";
import EventEmitter from "node:events";
import { URL } from "node:url";
import { Socket } from "node:net";

type ContinueInfoType = {
  type: number;
  buffer: Buffer[];
};

export type RainlinkWebsocketOptions = {
  timeout?: number;
  headers?: Record<string, unknown>;
};

export type RainlinkWebsocketFHInfo = {
  opcode: number;
  fin: boolean;
  payloadLength: number;
  mask: Buffer | null;
  startIndex: number;
};

export enum RainlinkWebsocketState {
  WAITING = "WAITING",
  PROCESSING = "PROCESSING",
}

function parseFrameHeaderInfo(buffer: Buffer) {
  let startIndex = 2;
  const opcode = buffer[0] & 15;
  const fin = (buffer[0] & 128) === 128;
  let payloadLength = buffer[1] & 127;

  let mask = null;
  if ((buffer[1] & 128) === 128) {
    mask = buffer.subarray(startIndex, startIndex + 4);

    startIndex += 4;
  }

  if (payloadLength === 126) {
    startIndex += 2;
    payloadLength = buffer.readUInt16BE(2);
  } else if (payloadLength === 127) {
    startIndex += 8;
    payloadLength = buffer.readUIntBE(4, 8);
  }

  return {
    opcode,
    fin,
    payloadLength,
    mask,
    startIndex,
  };
}

function parseFrameHeader(info: RainlinkWebsocketFHInfo, buffer: Buffer) {
  const slicedBuffer = buffer.subarray(info.startIndex, info.startIndex + info.payloadLength);

  if (info.mask) {
    for (let i = 0; i < info.payloadLength; i++) {
      slicedBuffer[i] = slicedBuffer[i] ^ info.mask[i & 3];
    }
  }

  return {
    opcode: info.opcode,
    fin: info.fin,
    buffer: slicedBuffer,
    payloadLength: info.payloadLength,
    rest: buffer.subarray(info.startIndex + info.payloadLength),
  };
}

export class RainlinkWebsocket extends EventEmitter {
  protected socket: Socket | null;
  protected continueInfo: ContinueInfoType;
  protected state: RainlinkWebsocketState;

  /**
   * Modded version of PWSL class
   * @param url The WS url have to connect
   * @param options Some additional options of PWSL
   * @instance
   */
  constructor(
    protected url: string,
    protected options: RainlinkWebsocketOptions
  ) {
    super();
    this.socket = null;
    this.continueInfo = {
      type: -1,
      buffer: [],
    };
    this.state = RainlinkWebsocketState.WAITING;

    this.connect();

    return this;
  }

  /**
   * Connect to current websocket link
   * @instance
   */
  public connect() {
    const parsedUrl = new URL(this.url);
    const isSecure = parsedUrl.protocol === "wss:";
    const agent = isSecure ? https : http;
    const key = crypto.randomBytes(16).toString("base64");

    const request = agent.request(
      (isSecure ? "https://" : "http://") + parsedUrl.hostname + parsedUrl.pathname + parsedUrl.search,
      {
        port: parsedUrl.port || (isSecure ? 443 : 80),
        timeout: this.options?.timeout ?? 0,
        headers: {
          "Sec-WebSocket-Key": key,
          "Sec-WebSocket-Version": 13,
          Upgrade: "websocket",
          Connection: "Upgrade",
          ...(this.options?.headers || {}),
        },
        method: "GET",
      }
    );

    request.on("error", (err) => {
      this.emit("error", err);
      this.emit("close");

      this.cleanup();
    });

    request.on("upgrade", (res, socket, head) => {
      socket.setNoDelay();
      socket.setKeepAlive(true);

      if (head.length !== 0) socket.unshift(head);

      if (res.headers.upgrade?.toLowerCase() !== "websocket") {
        socket.destroy();

        return;
      }

      const digest = crypto
        .createHash("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");

      if (res.headers["sec-websocket-accept"] !== digest) {
        socket.destroy();

        return;
      }

      socket.once("readable", () => this.checkData());

      socket.on("close", () => {
        this.emit("close");

        this.cleanup();
      });

      socket.on("error", (err) => {
        this.emit("error", err);
        this.emit("close");

        this.cleanup();
      });

      this.socket = socket;

      this.emit("open", socket, res.headers);
    });

    request.end();
  }

  protected async checkData() {
    const data = this.socket?.read();

    if (data && this.state === "WAITING") {
      this.state = RainlinkWebsocketState.PROCESSING;

      await this._processData(data);

      this.state = RainlinkWebsocketState.WAITING;
    }

    this.socket?.once("readable", () => this.checkData());
  }

  protected async _processData(data: Buffer) {
    const info = parseFrameHeaderInfo(data);
    const bodyLength = Buffer.byteLength(data) - info.startIndex;

    if (info.payloadLength > bodyLength) {
      const bytesLeft = info.payloadLength - bodyLength;

      const nextData = await new Promise((resolve) => {
        this.socket?.once("data", (data) => {
          if (data.length > bytesLeft) {
            this.socket?.unshift(data.subarray(bytesLeft));
            data = data.subarray(0, bytesLeft);
          }
          resolve(data);
        });
      });

      data = Buffer.concat([data, nextData as Uint8Array]);
    }

    const headers = parseFrameHeader(info, data);

    switch (headers.opcode) {
      case 0x0: {
        this.continueInfo.buffer.push(headers.buffer);

        if (headers.fin) {
          this.emit(
            "message",
            this.continueInfo.type === 1 ? this.continueInfo.buffer.join("") : Buffer.concat(this.continueInfo.buffer)
          );

          this.continueInfo = {
            type: -1,
            buffer: [],
          };
        }

        break;
      }
      case 0x1:
      case 0x2: {
        if (this.continueInfo.type !== -1 && this.continueInfo.type !== headers.opcode) {
          this.close(1002, "Invalid continuation frame");
          this.cleanup();

          return;
        }

        if (!headers.fin) {
          this.continueInfo.type = headers.opcode;
          this.continueInfo.buffer.push(headers.buffer);
        } else {
          this.emit("message", headers.opcode === 0x1 ? headers.buffer.toString("utf8") : headers.buffer);
        }

        break;
      }
      case 0x8: {
        if (headers.buffer.length === 0) {
          this.emit("close", 1006, "");
        } else {
          const code = headers.buffer.readUInt16BE(0);
          const reason = headers.buffer.subarray(2).toString("utf-8");

          this.emit("close", code, reason);
        }

        this.cleanup();

        break;
      }
      case 0x9: {
        const pong = Buffer.allocUnsafe(2);
        pong[0] = 0x8a;
        pong[1] = 0x00;

        this.socket?.write(pong);

        break;
      }
      case 0xa: {
        this.emit("pong");
      }
      // eslint-disable-next-line no-fallthrough
      default: {
        this.close(1002, "Invalid opcode");
        this.cleanup();

        return;
      }
    }

    if (headers.rest.length > 0) this.socket?.unshift(headers.rest);
  }

  /**
   * Clean up all current websocket state
   * @returns boolean
   */
  cleanup() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }

    this.continueInfo = {
      type: -1,
      buffer: [],
    };

    return true;
  }

  /**
   * Send raw buffer data to ws server
   * @returns boolean
   */
  sendData(data: Buffer, options: { len: number; fin?: boolean; opcode: number; mask?: Buffer | boolean }) {
    let payloadStartIndex = 2;
    let payloadLength = options.len;
    let mask = null;

    if (options.mask) {
      mask = Buffer.allocUnsafe(4);

      while ((mask[0] | mask[1] | mask[2] | mask[3]) === 0) crypto.randomFillSync(mask, 0, 4);

      payloadStartIndex += 4;
    }

    if (options.len >= 65536) {
      payloadStartIndex += 8;
      payloadLength = 127;
    } else if (options.len > 125) {
      payloadStartIndex += 2;
      payloadLength = 126;
    }

    const header = Buffer.allocUnsafe(payloadStartIndex);
    header[0] = options.fin ? options.opcode | 128 : options.opcode;
    header[1] = payloadLength;

    if (payloadLength === 126) {
      header.writeUInt16BE(options.len, 2);
    } else if (payloadLength === 127) {
      header.writeUIntBE(options.len, 2, 6);
    }

    if (options.mask) {
      header[1] |= 128;
      header[payloadStartIndex - 4] = mask![0];
      header[payloadStartIndex - 3] = mask![1];
      header[payloadStartIndex - 2] = mask![2];
      header[payloadStartIndex - 1] = mask![3];

      for (let i = 0; i < options.len; i++) {
        data[i] = data[i] ^ mask![i & 3];
      }
    }

    this.socket?.write(Buffer.concat([header, data]));

    return true;
  }

  /**
   * Send string data to ws server
   * @returns boolean
   */
  public send(data: string): boolean {
    const payload = Buffer.from(data, "utf-8");
    return this.sendData(payload, { len: payload.length, fin: true, opcode: 0x01, mask: true });
  }

  /**
   * Close the connection of tthe current ws server
   * @returns boolean
   */
  public close(code?: number, reason?: string) {
    const data = Buffer.allocUnsafe(2 + Buffer.byteLength(reason ?? "normal close"));
    data.writeUInt16BE(code ?? 1000);
    data.write(reason ?? "normal close", 2);

    this.sendData(data, { len: data.length, fin: true, opcode: 0x8 });

    return true;
  }
}
