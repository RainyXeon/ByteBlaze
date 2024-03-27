import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { Rainlink } from "../Rainlink.js";
import { metadata } from "../metadata.js";
import { RainlinkPlugin as SaveSessionPlugin } from "../Plugin/SaveSession/Plugin.js";
import { RawData, WebSocket } from "ws";
import { LavalinkLoadType, RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkRequesterOptions } from "../Interface/Rest.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { AbstractDriver } from "./AbstractDriver.js";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import { request } from "undici";
import util from "node:util";

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
    this.functions.set("getLyric", this.getLyric);
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
        "Something went wrong with lavalink server." +
          `Status code: ${res.statusCode}\n Headers: ${util.inspect(options.headers)}`
      );
      return undefined;
    }

    const preFinalData = (await res.body.json()) as D;
    let finalData: any = preFinalData;

    if (finalData.loadType) {
      finalData = this.convertV4trackResponse(finalData) as D;
    }

    return finalData;
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
        nl2Data.loadType = LavalinkLoadType.SEARCH;
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
    this.debug("[WARNING]: Nodelink doesn't support resuming, set resume to true is useless in Nodelink2 driver");
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
