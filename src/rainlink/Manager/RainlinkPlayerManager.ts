import { RainlinkDriver, RainlinkEvents, RainlinkPlayerState, VoiceState } from "../Interface/Constants.js";
import { VoiceChannelOptions } from "../Interface/Player.js";
import { RainlinkVoiceManager } from "./RainlinkVoiceManager.js";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import { Rainlink } from "../Rainlink.js";
import { RainlinkPlugin } from "../Plugin/VoiceReceiver/Plugin.js";

export class RainlinkPlayerManager extends Map<string, RainlinkPlayer> {
  /** The map of all voice manager that being handled */
  public voiceManagers: Map<string, RainlinkVoiceManager>;
  /** The rainlink manager */
  public manager: Rainlink;

  /**
   * The main class for handling lavalink players
   * @param manager The rainlink manager
   * @param voiceManagers The rainlink discord voice manager class
   */
  constructor(manager: Rainlink, voiceManagers: Map<string, RainlinkVoiceManager>) {
    super();
    this.voiceManagers = voiceManagers;
    this.manager = manager;
  }

  /**
   * Create a player
   * @returns RainlinkPlayer
   * @internal
   */
  async create(options: VoiceChannelOptions): Promise<RainlinkPlayer> {
    if (this.voiceManagers.has(options.guildId)) throw new Error("This guild already have an existing connection");
    const voiceManager = new RainlinkVoiceManager(this.manager, options);
    this.voiceManagers.set(voiceManager.guildId, voiceManager);
    try {
      await voiceManager.connect();
    } catch (error) {
      this.voiceManagers.delete(options.guildId);
      throw error;
    }
    try {
      const getCustomNode = this.manager.nodes.get(String(options.nodeName ? options.nodeName : ""));
      const node = getCustomNode ? getCustomNode : await this.manager.nodes.getLeastUsed();
      if (!node) throw new Error("Can't find any nodes to connect on");
      const customPlayer = this.manager.rainlinkOptions.options!.structures!.player;
      const player = customPlayer
        ? new customPlayer(this.manager, options, node, voiceManager)
        : new RainlinkPlayer(this.manager, options, node, voiceManager);
      const onUpdate = (state: VoiceState) => {
        if (state !== VoiceState.SESSION_READY) return;
        player.sendServerUpdate(voiceManager);
      };
      await player.sendServerUpdate(voiceManager);
      voiceManager.on("connectionUpdate", onUpdate);
      this.set(player.guildId, player);
      player.state = RainlinkPlayerState.CONNECTED;
      this.debug("Player created at " + options.guildId);
      this.manager.emit(RainlinkEvents.PlayerCreate, player);
      const voiceReceiver = this.manager.plugins.get("rainlink-voiceReceiver") as RainlinkPlugin;
      if (voiceManager && node.options.driver == RainlinkDriver.Nodelink2) voiceReceiver.open(node, options);
      return player;
    } catch (error) {
      voiceManager.disconnect();
      this.voiceManagers.delete(options.guildId);
      throw error;
    }
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

  /** @ignore */
  private debug(logs: string) {
    this.manager.emit(RainlinkEvents.Debug, `[Rainlink Player]: ${logs}`);
  }
}
