import { RainlinkEvents, RainlinkPlayerState, VoiceState } from "../Interface/Constants.js";
import { VoiceChannelOptions } from "../Interface/Player.js";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import { Rainlink } from "../Rainlink.js";
import { RainlinkPlugin } from "../Plugin/VoiceReceiver/Plugin.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";

export class RainlinkPlayerManager extends RainlinkDatabase<RainlinkPlayer> {
  /** The rainlink manager */
  public manager: Rainlink;

  /**
   * The main class for handling lavalink players
   * @param manager The rainlink manager
   */
  constructor(manager: Rainlink) {
    super();
    this.manager = manager;
  }

  /**
   * Create a player
   * @returns RainlinkPlayer
   * @internal
   */
  async create(options: VoiceChannelOptions): Promise<RainlinkPlayer> {
    if (this.get(options.guildId)) throw new Error("This guild already have an existing player");
    const getCustomNode = this.manager.nodes.get(String(options.nodeName ? options.nodeName : ""));
    const node = getCustomNode ? getCustomNode : await this.manager.nodes.getLeastUsed();
    if (!node) throw new Error("Can't find any nodes to connect on");
    const customPlayer =
      this.manager.rainlinkOptions.options!.structures && this.manager.rainlinkOptions.options!.structures.player;
    let player = customPlayer
      ? new customPlayer(this.manager, options, node)
      : new RainlinkPlayer(this.manager, options, node);
    this.set(player.guildId, player);
    try {
      player = await player.connect();
    } catch (err) {
      this.delete(player.guildId);
      throw err;
    }
    const onUpdate = (state: VoiceState) => {
      if (state !== VoiceState.SESSION_READY) return;
      player.sendServerUpdate();
    };
    await player.sendServerUpdate();
    player.on("connectionUpdate", onUpdate);
    player.state = RainlinkPlayerState.CONNECTED;
    this.debug("Player created at " + options.guildId);
    this.manager.emit(RainlinkEvents.PlayerCreate, player);
    const voiceReceiver = this.manager.plugins.get("rainlink-voiceReceiver") as RainlinkPlugin;
    if (voiceReceiver && node.driver.id.includes("nodelink")) voiceReceiver.open(node, options);
    return player;
  }

  /**
   * Destroy a player
   * @returns The destroyed / disconnected player or undefined if none
   * @internal
   */
  public async destroy(guildId: string = ""): Promise<void> {
    const player = this.get(guildId);
    if (player) await player.destroy();
  }

  protected debug(logs: string) {
    this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [PlayerManager] | ${logs}`);
  }
}
