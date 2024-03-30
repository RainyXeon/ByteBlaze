import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { Rainlink } from "../Rainlink.js";
import { metadata } from "../metadata.js";
import { RainlinkPlugin as SaveSessionPlugin } from "../Plugin/SaveSession/Plugin.js";
import { RawData, WebSocket } from "ws";
import { RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkRequesterOptions } from "../Interface/Rest.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { AbstractDriver } from "./AbstractDriver.js";
import { request } from "undici";
import util from "node:util";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";

export class Lavalink4 extends AbstractDriver {
  public wsUrl: string;
  public httpUrl: string;
  public sessionPlugin?: SaveSessionPlugin | null;
  public sessionId: string | null;
  public functions: Map<string, (player: RainlinkPlayer, ...args: any) => unknown>;
  private wsClient?: WebSocket;

  constructor(
    public manager: Rainlink,
    public options: RainlinkNodeOptions,
    public node: RainlinkNode
  ) {
    super();
    this.wsUrl = `${options.secure ? "wss" : "ws"}://${options.host}:${options.port}/v4/websocket`;
    this.httpUrl = `${options.secure ? "https://" : "http://"}${options.host}:${options.port}/v4`;
    this.sessionId = null;
    this.functions = new Map<string, (player: RainlinkPlayer, ...args: any) => unknown>();
  }

  public connect(): WebSocket {
    const isResume = this.manager.rainlinkOptions.options!.resume;
    if (this.sessionPlugin) {
      this.sessionId =
        this.sessionId == null && isResume
          ? this.sessionPlugin.getSession(this.options.host).sessionId
          : this.sessionId;
    }
    const ws = new WebSocket(this.wsUrl, {
      headers: {
        Authorization: this.options.auth,
        "User-Id": this.manager.id,
        "Client-Name": `${metadata.name}/${metadata.version} (${metadata.github})`,
        "Session-Id": this.sessionId !== null && isResume ? this.sessionId : "",
        "user-agent": this.manager.rainlinkOptions.options!.userAgent!,
      },
    });

    ws.on("open", () => {
      this.node.wsOpenEvent();
    });
    ws.on("message", (data: RawData) => this.wsMessageEvent(data));
    ws.on("error", (err) => this.node.wsErrorEvent(err));
    ws.on("close", (code: number, reason: Buffer) => this.node.wsCloseEvent(code, reason));
    this.wsClient = ws;
    return ws;
  }

  public async requester<D = any>(options: RainlinkRequesterOptions): Promise<D | undefined> {
    if (options.useSessionId && this.sessionId == null)
      throw new Error("sessionId not initalized! Please wait for lavalink get connected!");
    const url = new URL(`${this.httpUrl}${options.path}`);
    if (options.params) url.search = new URLSearchParams(options.params).toString();

    if (options.data) {
      options.body = JSON.stringify(options.data);
    }

    const lavalinkHeaders = {
      Authorization: this.options.auth,
      "User-Agent": this.manager.rainlinkOptions.options!.userAgent!,
      ...options.headers,
    };

    options.headers = lavalinkHeaders;
    options.path = url.pathname + url.search;

    const res = await request(url.origin, options);

    // this.debug(`Request URL: ${url.origin}${options.path}`);

    if (res.statusCode == 204) {
      this.debug("Player now destroyed");
      return undefined;
    }
    if (res.statusCode !== 200) {
      this.debug(
        "Something went wrong with lavalink server. " +
          `Status code: ${res.statusCode}\n Headers: ${util.inspect(options.headers)}`
      );
      return undefined;
    }

    const finalData = await res.body.json();

    return finalData as D;
  }

  protected wsMessageEvent(data: RawData) {
    const wsData = JSON.parse(data.toString());
    this.node.wsMessageEvent(wsData);
  }

  private debug(logs: string) {
    this.manager.emit(RainlinkEvents.Debug, `[Rainlink v4 Plugin]: ${logs}`);
  }

  public wsClose(): void {
    if (this.wsClient) this.wsClient.close();
  }

  public async updateSession(sessionId: string, mode: boolean, timeout: number): Promise<void> {
    const options: RainlinkRequesterOptions = {
      path: `/sessions/${sessionId}`,
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      data: {
        resuming: mode,
        timeout: timeout,
      },
    };

    await this.requester<{ resuming: boolean; timeout: number }>(options);
    this.debug(`Session updated! resume: ${mode}, timeout: ${timeout}`);
    return;
  }
}
