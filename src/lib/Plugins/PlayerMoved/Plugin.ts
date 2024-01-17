/**
 * All the code below is from kazagumo.mod
 * An edited version is retrieved from
 * https://github.com/Takiyo0/Kazagumo/tree/d118eaf22559bd3f2159e2e147a67876d3986669
 * Original developer: Takiyo0 (Github)
 * Mod developer: RainyXeon (Github)
 * Special thanks to Takiyo0 (Github)
 */

import { Kazagumo } from "../../Kazagumo.js";
import { KazagumoPlugin as Plugin, Events } from "../../Modules/Interfaces.js";

export class KazagumoPlugin extends Plugin {
  /**
   * Kazagumo instance.
   */
  public kazagumo: Kazagumo | null = null;

  /**
   * Initialize the plugin.
   * @param client Discord.Client
   */
  constructor(public client: any) {
    super();
  }

  /**
   * Load the plugin.
   * @param kazagumo Kazagumo
   */
  public load(kazagumo: Kazagumo): void {
    this.kazagumo = kazagumo;
    this.client.on("voiceStateUpdate", this.onVoiceStateUpdate.bind(this));
  }

  /**
   * Unload the plugin.
   */
  public unload(): void {
    this.client.removeListener(
      "voiceStateUpdate",
      this.onVoiceStateUpdate.bind(this)
    );
    this.kazagumo = null;
  }

  private onVoiceStateUpdate(oldState: any, newState: any): void {
    if (!this.kazagumo || oldState.id !== this.client.user.id) return;

    const newChannelId = newState.channelID || newState.channelId;
    const oldChannelId = oldState.channelID || oldState.channelId;
    const guildId = newState.guild.id;

    const player = this.kazagumo.players.get(guildId);
    if (!player) return;

    let state = "UNKNOWN";
    if (!oldChannelId && newChannelId) state = "JOINED";
    else if (oldChannelId && !newChannelId) state = "LEFT";
    else if (oldChannelId && newChannelId && oldChannelId !== newChannelId)
      state = "MOVED";

    if (state === "UNKNOWN") return;

    this.kazagumo.emit(Events.PlayerMoved, player, state, {
      oldChannelId,
      newChannelId,
    });
  }
}
