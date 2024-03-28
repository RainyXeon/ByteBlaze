import { PlayOptions, VoiceChannelOptions } from "../Interface/Player.js";
import { Rainlink } from "../Rainlink.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { RainlinkQueue } from "./RainlinkQueue.js";
import { RainlinkVoiceManager } from "../Manager/RainlinkVoiceManager.js";
import {
  RainlinkDriver,
  RainlinkEvents,
  RainlinkFilterData,
  RainlinkLoopMode,
  RainlinkPlayerState,
} from "../Interface/Constants.js";
import { RainlinkTrack } from "./RainlinkTrack.js";
import { UpdatePlayerInfo, UpdatePlayerOptions } from "../Interface/Rest.js";
import { Snowflake } from "discord.js";
import { RainlinkSearchOptions, RainlinkSearchResult } from "../Interface/Manager.js";
import { RainlinkPlugin } from "../Plugin/VoiceReceiver/Plugin.js";

export class RainlinkPlayer {
  /**
   * Main manager class
   */
  public manager: Rainlink;
  /**
   * Voice option of player
   */
  public voiceOptions: VoiceChannelOptions;
  /**
   * Player's current using lavalink server
   */
  public node: RainlinkNode;
  /**
   * Player's guild id
   */
  public guildId: string;
  /**
   * Player's voice id
   */
  public voiceId: string;
  /**
   * Player's text id
   */
  public textId: string;
  /**
   * Player's queue
   */
  public readonly queue: RainlinkQueue;
  /**
   * The temporary database of player, u can set any thing here and us like Map class!
   */
  public readonly data: Map<string, any>;
  /**
   * Whether the player is paused or not
   */
  public paused: boolean;
  /**
   * Get the current track's position of the player
   */
  public position: number;
  /**
   * Get the current volume of the player
   */
  public volume: number;
  /**
   * Whether the player is playing or not
   */
  public playing: boolean;
  /**
   * Get the current loop mode of the player
   */
  public loop: RainlinkLoopMode;
  /**
   * Get the current state of the player
   */
  public state: RainlinkPlayerState;
  /**
   * Whether the player is deafened or not
   */
  public deaf: boolean;
  /**
   * Whether the player is muted or not
   */
  public mute: boolean;
  /**
   * ID of the current track
   */
  public track: string | null;
  /**
   * Player's voice manager
   */
  public voiceManager: RainlinkVoiceManager;
  /** All function to extend support driver */
  public functions: Map<string, (...args: any) => unknown>;
  /** @ignore */
  public sudoDestroy: boolean;

  /**
   * The rainlink player handler class
   * @param manager The rainlink manager
   * @param voiceOptions The rainlink voice option, use VoiceChannelOptions interface
   * @param node The rainlink current use node
   * @param voiceManager The rainlink current voice manager
   */
  constructor(
    manager: Rainlink,
    voiceOptions: VoiceChannelOptions,
    node: RainlinkNode,
    voiceManager: RainlinkVoiceManager
  ) {
    this.manager = manager;
    this.voiceOptions = voiceOptions;
    this.node = node;
    this.guildId = this.voiceOptions.guildId;
    this.voiceId = this.voiceOptions.voiceId;
    this.textId = this.voiceOptions.textId;
    this.queue = new RainlinkQueue(this.manager, this);
    this.data = new Map<string, any>();
    this.paused = true;
    this.position = 0;
    this.volume = this.manager.rainlinkOptions.options!.defaultVolume!;
    this.playing = false;
    this.loop = RainlinkLoopMode.NONE;
    this.state = RainlinkPlayerState.DESTROYED;
    this.deaf = voiceOptions.deaf ?? false;
    this.mute = voiceOptions.mute ?? false;
    this.voiceManager = voiceManager;
    this.sudoDestroy = false;
    this.track = null;
    this.functions = new Map<string, (...args: any) => unknown>();
    if (this.node.driver.functions.size !== 0) {
      this.node.driver.functions.forEach((functionCode, key) => {
        this.functions.set(key, functionCode.bind(null, this));
      });
    }
    if (voiceOptions.volume && voiceOptions.volume !== this.volume) this.volume = voiceOptions.volume;
  }

  /**
   * Sends server update to lavalink
   * @internal
   */
  public async sendServerUpdate(voiceManager: RainlinkVoiceManager): Promise<void> {
    const playerUpdate = {
      guildId: this.guildId,
      playerOptions: {
        voice: {
          token: voiceManager.serverUpdate!.token,
          endpoint: voiceManager.serverUpdate!.endpoint,
          sessionId: voiceManager.sessionId!,
        },
      },
    };
    await this.node.rest.updatePlayer(playerUpdate);
  }

  /**
   * Destroy the player
   * @internal
   */
  public async destroy(): Promise<void> {
    this.checkDestroyed();
    this.sudoDestroy = true;
    const voiceManager = this.manager.voiceManagers.get(this.guildId);
    if (voiceManager) {
      voiceManager.disconnect();
      this.manager.voiceManagers.delete(this.guildId);
    }
    const voiceReceiver = this.manager.plugins.get("rainlink-voiceReceiver") as RainlinkPlugin;
    if (voiceManager && this.node.options.driver == RainlinkDriver.Nodelink2) voiceReceiver.close(this.guildId);
    await this.node.rest.destroyPlayer(this.guildId);
    this.manager.players.delete(this.guildId);
    this.state = RainlinkPlayerState.DESTROYED;
    this.debug("Player destroyed at " + this.guildId);
    this.voiceId = "";
    this.clear(false);
    this.manager.emit(RainlinkEvents.PlayerDestroy, this);
    this.sudoDestroy = false;
  }

  /**
   * Play a track
   * @param track Track to play
   * @param options Play options
   * @returns RainlinkPlayer
   */
  public async play(track?: RainlinkTrack, options?: PlayOptions): Promise<RainlinkPlayer> {
    this.checkDestroyed();

    if (track && !(track instanceof RainlinkTrack)) throw new Error("track must be a RainlinkTrack");

    if (!track && !this.queue.totalSize) throw new Error("No track is available to play");

    if (!options || typeof options.replaceCurrent !== "boolean") options = { ...options, replaceCurrent: false };

    if (track) {
      if (!options.replaceCurrent && this.queue.current) this.queue.unshift(this.queue.current);
      this.queue.current = track;
    } else if (!this.queue.current) this.queue.current = this.queue.shift();

    if (!this.queue.current) throw new Error("No track is available to play");

    const current = this.queue.current;

    let errorMessage: string | undefined;

    const resolveResult = await current.resolver(this.manager).catch((e: any) => {
      errorMessage = e.message;
      return null;
    });

    if (!resolveResult) {
      this.manager.emit(RainlinkEvents.TrackResolveError, this, current, errorMessage);
      this.debug(`Player ${this.guildId} resolve error: ${errorMessage}`);
      this.queue.current = null;
      this.queue.size ? await this.play() : this.manager.emit(RainlinkEvents.QueueEmpty, this);
      return this;
    }

    this.playing = true;
    this.track = current.encoded;

    const playerOptions: UpdatePlayerOptions = {
      track: {
        encoded: current.encoded,
      },
      ...options,
      volume: this.volume,
    };

    if (playerOptions.paused) {
      this.paused = playerOptions.paused;
      this.playing = !this.paused;
    }
    if (playerOptions.position) this.position = playerOptions.position;

    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      noReplace: options?.noReplace ?? false,
      playerOptions,
    });

    return this;
  }

  /**
   * Set the loop mode of the track
   * @param mode Mode to loop
   * @returns RainlinkPlayer
   */
  public setLoop(mode: RainlinkLoopMode): RainlinkPlayer {
    this.checkDestroyed();
    this.loop = mode;
    return this;
  }

  /**
   * Search track directly from player
   * @param query The track search query link
   * @param options The track search options
   * @returns RainlinkSearchResult
   */
  public async search(query: string, options?: RainlinkSearchOptions): Promise<RainlinkSearchResult> {
    this.checkDestroyed();
    return await this.manager.search(query, options);
  }

  /**
   * Pause the track
   * @returns RainlinkPlayer
   */
  public async pause(): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    if (this.paused == true) return this;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        paused: true,
      },
    });
    this.paused = true;
    this.playing = false;
    this.manager.emit(RainlinkEvents.PlayerPause, this, this.queue.current);
    return this;
  }

  /**
   * Resume the track
   * @returns RainlinkPlayer
   */
  public async resume(): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    if (this.paused == false) return this;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        paused: false,
      },
    });
    this.paused = false;
    this.playing = true;
    this.manager.emit(RainlinkEvents.PlayerResume, this, this.queue.current);
    return this;
  }

  /**
   * Pause or resume a track but different method
   * @param mode Whether to pause or not
   * @returns RainlinkPlayer
   */
  public async setPause(mode: boolean): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    if (this.paused == mode) return this;
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        paused: mode,
      },
    });
    this.paused = mode;
    this.playing = !mode;
    this.manager.emit(mode ? RainlinkEvents.PlayerPause : RainlinkEvents.PlayerResume, this, this.queue.current);
    return this;
  }

  /**
   * Play the previous track
   * @returns RainlinkPlayer
   */
  public async previous(): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    const prevoiusData = this.queue.previous;
    const current = this.queue.current;
    const index = prevoiusData.length - 1;
    if (index === -1 || !current) return this;
    await this.play(prevoiusData[index]);
    this.queue.previous.splice(index, 1);
    return this;
  }

  /**
   * Get all previous track
   * @returns RainlinkTrack[]
   */
  public getPrevious(): RainlinkTrack[] {
    this.checkDestroyed();
    return this.queue.previous;
  }

  /**
   * Skip the current track
   * @returns RainlinkPlayer
   */
  public async skip(): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        track: {
          encoded: null,
        },
      },
    });
    return this;
  }

  /**
   * Seek to another position in track
   * @param position Position to seek
   * @returns RainlinkPlayer
   */
  public async seek(position: number): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    if (!this.queue.current) throw new Error("Player has no current track in it's queue");
    if (!this.queue.current.isSeekable) throw new Error("The current track isn't seekable");

    position = Number(position);

    if (isNaN(position)) throw new Error("position must be a number");
    if (position < 0 || position > (this.queue.current.duration ?? 0))
      position = Math.max(Math.min(position, this.queue.current.duration ?? 0), 0);

    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        position: position,
      },
    });
    this.queue.current.position = position;
    return this;
  }

  /**
   * Set another volume in player
   * @param volume Volume to cange
   * @returns RainlinkPlayer
   */
  public async setVolume(volume: number): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    if (isNaN(volume)) throw new Error("volume must be a number");
    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        volume: volume,
      },
    });
    this.volume = volume;
    return this;
  }

  /**
   * Set player to mute or unmute
   * @param enable Enable or not
   * @returns RainlinkPlayer
   */
  public setMute(enable: boolean): RainlinkPlayer {
    this.checkDestroyed();
    if (enable == this.mute) return this;
    this.mute = enable;
    this.voiceManager.mute = enable;
    this.voiceManager.sendVoiceUpdate();
    return this;
  }

  /**
   * Stop all avtivities and reset to default
   * @param destroy Whenever you want to destroy a player or not
   * @returns RainlinkPlayer
   */
  public async stop(destroy: boolean): Promise<RainlinkPlayer> {
    this.checkDestroyed();

    if (destroy) {
      await this.destroy();
      return this;
    }

    this.clear(false);

    await this.node.rest.updatePlayer({
      guildId: this.guildId,
      playerOptions: {
        track: {
          encoded: null,
        },
      },
    });
    this.manager.emit(RainlinkEvents.TrackEnd, this, this.queue.current);
    this.manager.emit(RainlinkEvents.PlayerStop, this);

    return this;
  }

  /**
   * Reset all data to default
   * @param Whenever emit empty event or not
   * @inverval
   */
  public clear(emitEmpty: boolean): void {
    this.loop = RainlinkLoopMode.NONE;
    this.queue.clear();
    this.queue.current = undefined;
    this.queue.previous.length = 0;
    this.volume = this.voiceOptions.volume ?? this.manager.rainlinkOptions!.options!.defaultVolume ?? 100;
    this.paused = true;
    this.playing = false;
    this.track = null;
    this.data.clear();
    this.position = 0;
    if (emitEmpty) this.manager.emit(RainlinkEvents.QueueEmpty, this);
    return;
  }

  /**
   * Set player to deaf or undeaf
   * @param enable Enable or not
   * @returns RainlinkPlayer
   */
  public setDeaf(enable: boolean): RainlinkPlayer {
    this.checkDestroyed();
    if (enable == this.deaf) return this;
    this.deaf = enable;
    this.voiceManager.deaf = enable;
    this.voiceManager.sendVoiceUpdate();
    return this;
  }

  /**
   * Disconnect from the voice channel
   * @returns RainlinkPlayer
   */
  public disconnect(): RainlinkPlayer {
    this.checkDestroyed();
    this.voiceManager.disconnect();
    this.pause();
    this.state = RainlinkPlayerState.DISCONNECTED;
    this.debug(`Player disconnected; Guild id: ${this.guildId}`);
    return this;
  }

  /**
   * Connect from the voice channel
   * @returns RainlinkPlayer
   */
  public async connect(): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    if (this.state === RainlinkPlayerState.CONNECTED || !!this.voiceId) throw new Error("Player is already connected");
    await this.voiceManager.connect();
    this.state = RainlinkPlayerState.CONNECTED;
    this.debug(`Player ${this.guildId} connected`);
    return this;
  }

  /**
   * Set text channel
   * @param textId Text channel ID
   * @returns RainlinkPlayer
   */
  public setTextChannel(textId: Snowflake): RainlinkPlayer {
    this.checkDestroyed();
    this.textId = textId;
    return this;
  }

  /**
   * Set voice channel and move the player to the voice channel
   * @param voiceId Voice channel ID
   * @returns RainlinkPlayer
   */
  public setVoiceChannel(voiceId: Snowflake): RainlinkPlayer {
    this.checkDestroyed();
    this.voiceId = voiceId;

    const voiceManager = this.manager.voiceManagers.get(this.guildId);

    if (voiceManager) {
      voiceManager.disconnect();
      this.manager.voiceManagers.delete(this.guildId);
    }

    const newVoiceManager = new RainlinkVoiceManager(this.manager, {
      guildId: this.guildId,
      voiceId: voiceId,
      textId: this.textId,
      shardId: this.voiceOptions.shardId,
      mute: this.mute,
      deaf: this.deaf,
    });

    this.voiceManager = newVoiceManager;

    this.debug(`Player ${this.guildId} moved to voice channel ${voiceId}`);

    return this;
  }

  /**
   * Set a filter that prebuilt in rainlink
   * @param filter The filter name
   * @returns RainlinkPlayer
   */
  public async setFilter(filter: keyof typeof RainlinkFilterData): Promise<RainlinkPlayer> {
    this.checkDestroyed();

    const filterData = RainlinkFilterData[filter as keyof typeof RainlinkFilterData];

    if (!filterData) throw new Error("Filter not found");

    await this.send({
      guildId: this.guildId,
      playerOptions: {
        filters: filterData,
      },
    });

    return this;
  }

  /**
   * Send custom player update data to lavalink server
   * @param data Data to change
   * @returns RainlinkPlayer
   */
  public async send(data: UpdatePlayerInfo): Promise<RainlinkPlayer> {
    this.checkDestroyed();
    await this.node.rest.updatePlayer(data);
    return this;
  }

  /** @ignore */
  private debug(logs: string): void {
    this.manager.emit(RainlinkEvents.Debug, `[Rainlink Player]: ${logs}`);
  }

  /** @ignore */
  protected checkDestroyed(): void {
    if (this.state === RainlinkPlayerState.DESTROYED) throw new Error("Player is destroyed");
  }
}
