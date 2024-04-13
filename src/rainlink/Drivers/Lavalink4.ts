import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { Rainlink } from "../Rainlink.js";
import { metadata } from "../metadata.js";
import { RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkRequesterOptions } from "../Interface/Rest.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { AbstractDriver } from "./AbstractDriver.js";
import util from "node:util";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import { RainlinkWebsocket } from "../Node/RainlinkWebsocket.js";

export class Lavalink4 extends AbstractDriver {
  public id: string = "lavalink@4";
  public wsUrl: string = "";
  public httpUrl: string = "";
  public sessionId: string | null;
  public functions: Map<string, (player: RainlinkPlayer, ...args: any) => unknown>;
  private wsClient?: RainlinkWebsocket;
  public manager: Rainlink | null = null;
  public options: RainlinkNodeOptions | null = null;
  public node: RainlinkNode | null = null;

  constructor() {
    super();
    this.functions = new Map<string, (player: RainlinkPlayer, ...args: any) => unknown>();
    this.sessionId = null;
  }

  public get isRegistered(): boolean {
    return (
      this.manager !== null &&
      this.options !== null &&
      this.node !== null &&
      this.wsUrl.length !== 0 &&
      this.httpUrl.length !== 0
    );
  }

  public initial(manager: Rainlink, options: RainlinkNodeOptions, node: RainlinkNode): void {
    this.manager = manager;
    this.options = options;
    this.node = node;
    this.wsUrl = `${options.secure ? "wss" : "ws"}://${options.host}:${options.port}/v4/websocket`;
    this.httpUrl = `${options.secure ? "https://" : "http://"}${options.host}:${options.port}/v4`;
  }

  public connect(): RainlinkWebsocket {
    if (!this.isRegistered) throw new Error(`Driver ${this.id} not registered by using initial()`);
    const isResume = this.manager!.rainlinkOptions.options!.resume;
    const ws = new RainlinkWebsocket(this.wsUrl, {
      headers: {
        Authorization: this.options!.auth,
        "User-Id": this.manager!.id,
        "Client-Name": `${metadata.name}/${metadata.version} (${metadata.github})`,
        "Session-Id": this.sessionId !== null && isResume ? this.sessionId : "",
        "user-agent": this.manager!.rainlinkOptions.options!.userAgent!,
      },
    });

    ws.on("open", () => {
      this.node!.wsOpenEvent();
    });
    ws.on("message", (data) => this.wsMessageEvent(data));
    ws.on("error", (err) => this.node!.wsErrorEvent(err));
    ws.on("close", (code: number, reason: Buffer) => {
      this.node!.wsCloseEvent(code, reason);
      ws.removeAllListeners();
    });
    this.wsClient = ws;
    return ws;
  }

  public async requester<D = any>(options: RainlinkRequesterOptions): Promise<D | undefined> {
    if (!this.isRegistered) throw new Error(`Driver ${this.id} not registered by using initial()`);
    if (options.useSessionId && this.sessionId == null)
      throw new Error("sessionId not initalized! Please wait for lavalink get connected!");
    const url = new URL(`${this.httpUrl}${options.path}`);
    if (options.params) url.search = new URLSearchParams(options.params).toString();

    if (options.data) {
      options.body = JSON.stringify(options.data);
    }

    const lavalinkHeaders = {
      Authorization: this.options!.auth,
      "User-Agent": this.manager!.rainlinkOptions.options!.userAgent!,
      ...options.headers,
    };

    options.headers = lavalinkHeaders;
    options.path = url.pathname + url.search;

    const res = await fetch(url.origin + options.path, options);

    // this.debug(`Request URL: ${url.origin}${options.path}`);

    if (res.status == 204) {
      this.debug("Player now destroyed");
      return undefined;
    }
    if (res.status !== 200) {
      this.debug(
        "Something went wrong with lavalink server. " +
          `Status code: ${res.status}\n Headers: ${util.inspect(options.headers)}`
      );
      return undefined;
    }

    const finalData = await res.json();

    this.debug(`${options.method} ${options.path}`);

    return finalData as D;
  }

  protected wsMessageEvent(data: string) {
    if (!this.isRegistered) throw new Error(`Driver ${this.id} not registered by using initial()`);
    const wsData = JSON.parse(data.toString());
    this.node!.wsMessageEvent(wsData);
  }

  private debug(logs: string) {
    if (!this.isRegistered) throw new Error(`Driver ${this.id} not registered by using initial()`);
    this.manager!.emit(RainlinkEvents.Debug, `[Lavalink4 Driver]: ${logs}`);
  }

  public wsClose(): void {
    if (this.wsClient) this.wsClient.close(1006, "Self closed");
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
