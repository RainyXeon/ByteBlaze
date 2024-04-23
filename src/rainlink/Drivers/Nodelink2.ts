import { Rainlink } from "../Rainlink.js";
import { metadata } from "../metadata.js";
import { LavalinkLoadType, RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkRequesterOptions } from "../Interface/Rest.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { AbstractDriver } from "./AbstractDriver.js";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import util from "node:util";
import { RainlinkWebsocket } from "../Utilities/RainlinkWebsocket.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";

export enum Nodelink2loadType {
  SHORTS = "shorts",
  ALBUM = "album",
  ARTIST = "artist",
  SHOW = "show",
  EPISODE = "episode",
  STATION = "station",
  PODCAST = "podcast",
}

export interface NodelinkGetLyricsInterface {
  loadType: Nodelink2loadType | LavalinkLoadType;
  data:
    | {
        name: string;
        synced: boolean;
        data: {
          startTime: number;
          endTime: number;
          text: string;
        }[];
        rtl: boolean;
      }
    | Record<string, never>;
}

export class Nodelink2 extends AbstractDriver {
  public id: string = "nodelink/v2/nari";
  public wsUrl: string = "";
  public httpUrl: string = "";
  public sessionId: string | null;
  public playerFunctions: RainlinkDatabase<(player: RainlinkPlayer, ...args: any) => unknown>;
  public globalFunctions: RainlinkDatabase<(manager: Rainlink, ...args: any) => unknown>;
  protected wsClient?: RainlinkWebsocket;
  public manager: Rainlink | null = null;
  public node: RainlinkNode | null = null;

  constructor() {
    super();
    this.sessionId = null;
    this.playerFunctions = new RainlinkDatabase<(player: RainlinkPlayer, ...args: any) => unknown>();
    this.globalFunctions = new RainlinkDatabase<(manager: Rainlink, ...args: any) => unknown>();
    this.playerFunctions.set("getLyric", this.getLyric);
  }

  public get isRegistered(): boolean {
    return this.manager !== null && this.node !== null && this.wsUrl.length !== 0 && this.httpUrl.length !== 0;
  }

  public initial(manager: Rainlink, node: RainlinkNode): void {
    this.manager = manager;
    this.node = node;
    this.wsUrl = `${this.node.options.secure ? "wss" : "ws"}://${this.node.options.host}:${this.node.options.port}/v4/websocket`;
    this.httpUrl = `${this.node.options.secure ? "https://" : "http://"}${this.node.options.host}:${this.node.options.port}/v4`;
  }

  public connect(): RainlinkWebsocket {
    if (!this.isRegistered) throw new Error(`Driver ${this.id} not registered by using initial()`);
    const isResume = this.manager!.rainlinkOptions.options!.resume;
    const ws = new RainlinkWebsocket(this.wsUrl, {
      headers: {
        Authorization: this.node!.options.auth,
        "User-Id": this.manager!.id,
        "Content-Encoding": "brotli, gzip, deflate",
        "accept-encoding": "brotli, gzip, deflate",
        "Client-Name": `${metadata.name}/${metadata.version} (${metadata.github})`,
        "Session-Id": this.sessionId !== null && isResume ? this.sessionId : "",
        "user-agent": this.manager!.rainlinkOptions.options!.userAgent!,
        "Num-Shards": this.manager!.shardCount,
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
      Authorization: this.node!.options.auth,
      "User-Agent": this.manager!.rainlinkOptions.options!.userAgent!,
      "Content-Encoding": "brotli, gzip, deflate",
      "accept-encoding": "brotli, gzip, deflate",
      ...options.headers,
    };

    options.headers = lavalinkHeaders;
    options.path = url.pathname + url.search;

    const res = await fetch(url.origin + options.path, options);

    if (res.status == 204) {
      this.debug("Player now destroyed");
      return undefined;
    }
    if (res.status !== 200) {
      this.debug(`${options.method ?? "GET"} ${options.path} payload=${options.body ? String(options.body) : "{}"}`);
      this.debug(
        "Something went wrong with lavalink server. " +
          `Status code: ${res.status}\n Headers: ${util.inspect(options.headers)}`
      );
      return undefined;
    }

    const preFinalData = (await res.json()) as D;
    let finalData: any = preFinalData;

    if (finalData.loadType) {
      finalData = this.convertV4trackResponse(finalData) as D;
    }

    this.debug(`${options.method ?? "GET"} ${options.path} payload=${options.body ? String(options.body) : "{}"}`);

    return finalData;
  }

  protected wsMessageEvent(data: string) {
    if (!this.isRegistered) throw new Error(`Driver ${this.id} not registered by using initial()`);
    const wsData = JSON.parse(data.toString());
    this.node!.wsMessageEvent(wsData);
  }

  protected debug(logs: string) {
    if (!this.isRegistered) throw new Error(`Driver ${this.id} not registered by using initial()`);
    this.manager!.emit(RainlinkEvents.Debug, `[Rainlink] -> [Driver] -> [Nodelink2] | ${logs}`);
  }

  public wsClose(): void {
    if (this.wsClient) this.wsClient.close(1006, "Self closed");
  }

  protected convertV4trackResponse(nl2Data: Record<string, any>): Record<string, any> {
    if (!nl2Data) return {};
    switch (nl2Data.loadType) {
      case Nodelink2loadType.SHORTS: {
        nl2Data.loadType = LavalinkLoadType.TRACK;
        break;
      }
      case Nodelink2loadType.ALBUM: {
        nl2Data.loadType = LavalinkLoadType.PLAYLIST;
        break;
      }
      case Nodelink2loadType.ARTIST: {
        nl2Data.loadType = LavalinkLoadType.PLAYLIST;
        break;
      }
      case Nodelink2loadType.EPISODE: {
        nl2Data.loadType = LavalinkLoadType.PLAYLIST;
        break;
      }
      case Nodelink2loadType.STATION: {
        nl2Data.loadType = LavalinkLoadType.PLAYLIST;
        break;
      }
      case Nodelink2loadType.PODCAST: {
        nl2Data.loadType = LavalinkLoadType.PLAYLIST;
        break;
      }
      case Nodelink2loadType.SHOW: {
        nl2Data.loadType = LavalinkLoadType.PLAYLIST;
        break;
      }
      default: {
        nl2Data.loadType = LavalinkLoadType.TRACK;
        break;
      }
    }
    return nl2Data;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async updateSession(sessionId: string, mode: boolean, timeout: number): Promise<void> {
    this.debug("WARNING: Nodelink doesn't support resuming, set resume to true is useless");
    return;
  }

  public async getLyric(player: RainlinkPlayer, language: string): Promise<NodelinkGetLyricsInterface | undefined> {
    const options: RainlinkRequesterOptions = {
      path: "/loadlyrics",
      params: {
        encodedTrack: String(player.queue.current?.encoded),
        language: language,
      },
      useSessionId: false,
      headers: { "Content-Type": "application/json" },
      method: "GET",
    };
    const data = await player.node.driver.requester<NodelinkGetLyricsInterface>(options);
    return data;
  }

  protected testJSON(text: string) {
    if (typeof text !== "string") {
      return false;
    }
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }
}
