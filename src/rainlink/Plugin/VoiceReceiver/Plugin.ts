import { RainlinkPlugin as Plugin } from "../RainlinkPlugin.js";
import { Rainlink } from "../../Rainlink.js";
import { RainlinkEvents, RainlinkPluginType } from "../../Interface/Constants.js";
import { RawData, WebSocket } from "ws";
import { RainlinkNode } from "../../Node/RainlinkNode.js";
import { metadata } from "../../metadata.js";
import { VoiceChannelOptions } from "../../Interface/Player.js";

export class RainlinkPlugin extends Plugin {
  protected manager?: Rainlink;
  /** Whenever the plugin is enabled or not */
  public enabled: boolean = false;
  protected runningWs: Map<string, WebSocket> = new Map<string, WebSocket>();

  constructor() {
    super();
  }

  /** Name function for getting plugin name */
  public name(): string {
    return "rainlink-voiceReceiver";
  }

  /** Type function for diferent type of plugin */
  public type(): RainlinkPluginType {
    return RainlinkPluginType.Default;
  }

  /** Open the ws voice reciver client */
  public open(node: RainlinkNode, voiceOptions: VoiceChannelOptions): void {
    if (!this.enabled) throw new Error("This plugin is unloaded!");
    if (!node.options.driver?.includes("nodelink"))
      throw new Error("This node not support voice receiver, please use Nodelink2 to use this feature!");
    const wsUrl = `${node.options.secure ? "wss" : "ws"}://${node.options.host}:${node.options.port}`;
    const ws = new WebSocket(wsUrl + "/connection/data", {
      headers: {
        Authorization: node.options.auth,
        "User-Id": this.manager!.id,
        "Client-Name": `${metadata.name}/${metadata.version} (${metadata.github})`,
        "user-agent": this.manager!.rainlinkOptions.options!.userAgent!,
        "Guild-Id": voiceOptions.guildId,
      },
    });
    this.runningWs.set(voiceOptions.guildId, ws);
    ws.on("open", () => {
      this.debug("Connected to nodelink's voice receive server!");
      this.manager?.emit(RainlinkEvents.VoiceConnect, node);
    });
    ws.on("message", (data: RawData) => this.wsMessageEvent(node, data));
    ws.on("error", (err) => {
      this.debug("Errored at nodelink's voice receive server!");
      this.manager?.emit(RainlinkEvents.VoiceError, node, err);
    });
    ws.on("close", (code: number, reason: Buffer) => {
      this.debug(`Disconnected to nodelink's voice receive server! Code: ${code} Reason: ${reason}`);
      this.manager?.emit(RainlinkEvents.VoiceDisconnect, node, code, reason);
      ws.removeAllListeners();
    });
  }

  /** Open the ws voice reciver client */
  public close(guildId: string): void {
    const targetWs = this.runningWs.get(guildId);
    if (!targetWs) return;
    targetWs.close();
    this.runningWs.delete(guildId);
    this.debug("Destroy connection to nodelink's voice receive server!");
    targetWs.removeAllListeners();
    return;
  }

  protected wsMessageEvent(node: RainlinkNode, data: RawData) {
    const wsData = JSON.parse(data.toString());
    this.debug(String(data));
    switch (wsData.type) {
      case "startSpeakingEvent": {
        this.manager?.emit(RainlinkEvents.VoiceStartSpeaking, node, wsData.data.userId, wsData.data.guildId);
        break;
      }
      case "endSpeakingEvent": {
        this.manager?.emit(
          RainlinkEvents.VoiceEndSpeaking,
          node,
          wsData.data.data,
          wsData.data.userId,
          wsData.data.guildId
        );
        break;
      }
    }
    // this.node.wsMessageEvent(wsData);
  }

  /** Load function for make the plugin working */
  public load(manager: Rainlink): void {
    this.manager = manager;
    this.enabled = true;
  }

  /** unload function for make the plugin stop working */
  public unload(manager: Rainlink): void {
    this.manager = manager;
    this.enabled = false;
  }

  private debug(logs: string) {
    this.manager ? this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Plugin] / [Voice Receiver] | ${logs}`) : true;
  }
}
