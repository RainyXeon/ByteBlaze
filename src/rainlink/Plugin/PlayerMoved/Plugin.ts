import { RainlinkEvents, RainlinkPluginType } from "../../Interface/Constants.js";
import { Rainlink } from "../../Rainlink.js";
import { RainlinkPlugin as Plugin } from "./../RainlinkPlugin.js";

export class RainlinkPlugin extends Plugin {
  private rainlink: Rainlink | null = null;

  /**
   * Initialize the plugin.
   * @param client Discord.Client
   */
  constructor(public client: any) {
    super();
  }

  /**
   * Type of the plugin
   * @returns RainlinkPluginType
   */
  public type(): RainlinkPluginType {
    return RainlinkPluginType.Default;
  }

  /**
   * Load the plugin.
   * @param rainlink rainlink
   */
  public load(rainlink: Rainlink): void {
    this.rainlink = rainlink;
    this.client.on("voiceStateUpdate", this.onVoiceStateUpdate.bind(this));
  }

  /**
   * The name of the plugin
   * @returns string
   */
  public name(): string {
    return "rainlink-playerMoved";
  }

  /**
   * Unload the plugin.
   */
  public unload(): void {
    this.client.removeListener("voiceStateUpdate", this.onVoiceStateUpdate.bind(this));
    this.rainlink = null;
  }

  private onVoiceStateUpdate(oldState: any, newState: any): void {
    if (!this.rainlink || oldState.id !== this.client.user.id) return;

    const newChannelId = newState.channelID || newState.channelId;
    const oldChannelId = oldState.channelID || oldState.channelId;
    const guildId = newState.guild.id;

    const player = this.rainlink.players.get(guildId);
    if (!player) return;

    let state = "UNKNOWN";
    if (!oldChannelId && newChannelId) state = "JOINED";
    else if (oldChannelId && !newChannelId) state = "LEFT";
    else if (oldChannelId && newChannelId && oldChannelId !== newChannelId) state = "MOVED";

    if (state === "UNKNOWN") return;

    this.rainlink.emit(RainlinkEvents.PlayerMoved, player, state, {
      oldChannelId,
      newChannelId,
    });
  }
}
