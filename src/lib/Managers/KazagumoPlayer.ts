/**
 * All the code below is from kazagumo.mod
 * An edited version is retrieved from
 * https://github.com/Takiyo0/Kazagumo/tree/d118eaf22559bd3f2159e2e147a67876d3986669
 * Original developer: Takiyo0 (Github)
 * Mod developer: RainyXeon (Github)
 * Special thanks to Takiyo0 (Github)
 */

import { Kazagumo } from "../Kazagumo.js";
import { KazagumoQueue } from "./Supports/KazagumoQueue.js";
import {
  Player,
  Node,
  WebSocketClosedEvent,
  TrackExceptionEvent,
  PlayerUpdate,
  TrackStuckEvent,
  FilterOptions,
  UpdatePlayerInfo,
} from "shoukaku";
import {
  KazagumoError,
  KazagumoPlayerOptions,
  PlayerState,
  Events,
  PlayOptions,
  KazagumoSearchOptions,
  KazagumoSearchResult,
} from "../Modules/Interfaces.js";
import { KazagumoTrack } from "./Supports/KazagumoTrack.js";
import { Snowflake } from "discord.js";

export class KazagumoPlayer {
  /**
   * Kazagumo options
   */
  private options: KazagumoPlayerOptions;
  /**
   * Kazagumo Instance
   */
  private readonly kazagumo: Kazagumo;
  /**
   * Shoukaku's Player instance
   */
  public shoukaku: Player;
  /**
   * The guild ID of the player
   */
  public readonly guildId: Snowflake;
  /**
   * The voice channel ID of the player
   */
  public voiceId: Snowflake | null;
  /**
   * The text channel ID of the player
   */
  public textId: Snowflake;
  /**
   * Player's queue
   */
  public readonly queue: KazagumoQueue;
  /**
   * Get the current state of the player
   */
  public state: PlayerState = PlayerState.CONNECTING;
  /**
   * Paused state of the player
   */
  public paused: boolean = false;
  /**
   * Whether the player is playing or not
   */
  public playing: boolean = false;
  /**
   * Loop status
   */
  public loop: "none" | "queue" | "track" = "none";
  /**
   * Search track/s
   */
  public search: (
    query: string,
    options?: KazagumoSearchOptions
  ) => Promise<KazagumoSearchResult>;
  /**
   * Player's custom data
   */
  public readonly data: Map<string, any> = new Map();

  /**
   * Initialize the player
   * @param kazagumo Kazagumo instance
   * @param player Shoukaku's Player instance
   * @param options Kazagumo options
   * @param customData private readonly customData
   */
  constructor(
    kazagumo: Kazagumo,
    player: Player,
    options: KazagumoPlayerOptions,
    private readonly customData: unknown
  ) {
    this.options = options;
    this.kazagumo = kazagumo;
    this.shoukaku = player;
    this.guildId = options.guildId;
    this.voiceId = options.voiceId;
    this.textId = options.textId;
    this.queue = new KazagumoQueue(this);

    if (options.volume !== 100) this.setVolume(options.volume);

    this.search = (
      typeof this.options.searchWithSameNode === "boolean"
        ? this.options.searchWithSameNode
        : true
    )
      ? (query: string, opt?: KazagumoSearchOptions) =>
          kazagumo.search.bind(kazagumo)(
            query,
            opt ? { ...opt, nodeName: this.shoukaku.node.name } : undefined
          )
      : kazagumo.search.bind(kazagumo);

    this.shoukaku.on("start", () => {
      this.playing = true;
      this.emit(Events.PlayerStart, this, this.queue.current);
    });

    this.shoukaku.on("end", (data) => {
      // This event emits STOPPED reason when destroying, so return to prevent double emit
      if (
        this.state === PlayerState.DESTROYING ||
        this.state === PlayerState.DESTROYED
      )
        return this.emit(
          Events.Debug,
          `Player ${this.guildId} destroyed from end event`
        );

      if (data.reason === "replaced") return this.emit(Events.PlayerEnd, this);
      if (["loadFailed", "cleanup"].includes(data.reason)) {
        if (this.queue.current) this.queue.previous.push(this.queue.current);
        this.playing = false;
        if (!this.queue.length) return this.emit(Events.PlayerEmpty, this);
        this.emit(Events.PlayerEnd, this, this.queue.current);
        this.queue.current = null;
        return this.play();
      }

      if (this.loop === "track" && this.queue.current)
        this.queue.unshift(this.queue.current);
      if (this.loop === "queue" && this.queue.current)
        this.queue.push(this.queue.current);

      if (this.queue.current) this.queue.previous.push(this.queue.current);
      const currentSong = this.queue.current;
      this.queue.current = null;

      if (this.queue.length) this.emit(Events.PlayerEnd, this, currentSong);
      else {
        this.playing = false;
        return this.emit(Events.PlayerEmpty, this);
      }

      return this.play();
    });

    this.shoukaku.on("closed", (data: WebSocketClosedEvent) => {
      this.playing = false;
      this.emit(Events.PlayerClosed, this, data);
    });

    this.shoukaku.on("exception", (data: TrackExceptionEvent) => {
      this.playing = false;
      this.emit(Events.PlayerException, this, data);
    });

    this.shoukaku.on("update", (data: PlayerUpdate) =>
      this.emit(Events.PlayerUpdate, this, data)
    );
    this.shoukaku.on("stuck", (data: TrackStuckEvent) =>
      this.emit(Events.PlayerStuck, this, data)
    );
    this.shoukaku.on("resumed", () => this.emit(Events.PlayerResumed, this));
  }

  /**
   * Get volume
   */
  public get volume(): number {
    return this.shoukaku.filters.volume || 1;
  }

  /**
   * Get player position
   */
  public get position(): number {
    return this.shoukaku.position;
  }

  /**
   * Get filters
   */
  public get filters(): FilterOptions {
    return this.shoukaku.filters;
  }

  private get node(): Node {
    return this.shoukaku.node;
  }

  /**
   * Pause the player
   * @param pause Whether to pause or not
   * @returns KazagumoPlayer
   */
  public pause(pause: boolean): KazagumoPlayer {
    if (typeof pause !== "boolean")
      throw new KazagumoError(1, "pause must be a boolean");

    if (this.paused === pause || !this.queue.totalSize) {
      this.emit(pause ? Events.PlayerPause : Events.PlayerResume, this);
      return this;
    }
    this.paused = pause;
    this.playing = !pause;
    this.shoukaku.setPaused(pause);
    this.emit(pause ? Events.PlayerPause : Events.PlayerResume, this);

    return this;
  }

  /**
   * Set text channel
   * @param textId Text channel ID
   * @returns KazagumoPlayer
   */
  public setTextChannel(textId: Snowflake): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, "Player is already destroyed");

    this.textId = textId;

    return this;
  }

  /**
   * Set voice channel and move the player to the voice channel
   * @param voiceId Voice channel ID
   * @returns KazagumoPlayer
   */
  public setVoiceChannel(voiceId: Snowflake): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, "Player is already destroyed");
    this.state = PlayerState.CONNECTING;

    this.voiceId = voiceId;
    this.kazagumo.KazagumoOptions.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceId,
        self_mute: false,
        self_deaf: this.options.deaf,
      },
    });

    this.emit(
      Events.Debug,
      `Player ${this.guildId} moved to voice channel ${voiceId}`
    );

    return this;
  }

  /**
   * Get the previous track from the queue
   * @param splice Whether to remove the track from the previous list or not
   */
  public getPrevious(splice: boolean = false): KazagumoTrack[] {
    if (splice)
      return this.queue.previous.splice(0, this.queue.previous.length);
    return this.queue.previous;
  }

  /**
   * Set loop mode
   * @param [loop] Loop mode
   * @returns KazagumoPlayer
   */
  public setLoop(loop?: "none" | "queue" | "track"): KazagumoPlayer {
    if (loop === undefined) {
      if (this.loop === "none") this.loop = "queue";
      else if (this.loop === "queue") this.loop = "track";
      else if (this.loop === "track") this.loop = "none";
      return this;
    }

    if (loop === "none" || loop === "queue" || loop === "track") {
      this.loop = loop;
      return this;
    }

    throw new KazagumoError(1, "loop must be one of 'none', 'queue', 'track'");
  }

  /**
   * Play a track
   * @param track Track to play
   * @param options Play options
   * @returns KazagumoPlayer
   */
  public async play(
    track?: KazagumoTrack,
    options?: PlayOptions
  ): Promise<KazagumoPlayer> {
    if (this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, "Player is already destroyed");

    if (track && !(track instanceof KazagumoTrack))
      throw new KazagumoError(1, "track must be a KazagumoTrack");

    if (!track && !this.queue.totalSize)
      throw new KazagumoError(1, "No track is available to play");

    if (!options || typeof options.replaceCurrent !== "boolean")
      options = { ...options, replaceCurrent: false };

    if (track) {
      if (!options.replaceCurrent && this.queue.current)
        this.queue.unshift(this.queue.current);
      this.queue.current = track;
    } else if (!this.queue.current) this.queue.current = this.queue.shift();

    if (!this.queue.current)
      throw new KazagumoError(1, "No track is available to play");

    const current = this.queue.current;
    current.setKazagumo(this.kazagumo);

    let errorMessage: string | undefined;

    const resolveResult = await current
      .resolve({ player: this as KazagumoPlayer })
      .catch((e: any) => {
        errorMessage = e.message;
        return null;
      });

    if (!resolveResult) {
      this.emit(Events.PlayerResolveError, this, current, errorMessage);
      this.emit(
        Events.Debug,
        `Player ${this.guildId} resolve error: ${errorMessage}`
      );
      this.queue.current = null;
      this.queue.size ? await this.play() : this.emit(Events.PlayerEmpty, this);
      return this;
    }

    const playOptions = { track: current.track, options: {} };
    if (options) playOptions.options = { ...options, noReplace: false };
    else playOptions.options = { noReplace: false };

    this.shoukaku.playTrack(playOptions);

    return this;
  }

  /**
   * Skip the current track
   * @returns KazagumoPlayer
   */
  public skip(): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, "Player is already destroyed");

    this.shoukaku.stopTrack();

    return this;
  }

  /**
   * Seek to a position
   * @param position Position in seconds
   * @returns KazagumoPlayer
   */
  public async seek(position: number): Promise<KazagumoPlayer> {
    if (this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, "Player is already destroyed");
    if (!this.queue.current)
      throw new KazagumoError(1, "Player has no current track in it's queue");
    if (!this.queue.current.isSeekable)
      throw new KazagumoError(1, "The current track isn't seekable");

    position = Number(position);

    if (isNaN(position))
      throw new KazagumoError(1, "position must be a number");
    if (position < 0 || position > (this.queue.current.length ?? 0))
      position = Math.max(
        Math.min(position, this.queue.current.length ?? 0),
        0
      );

    this.queue.current.position = position;
    await this.shoukaku.seekTo(position);

    return this;
  }

  /**
   * Set the volume
   * @param volume Volume
   * @returns KazagumoPlayer
   */
  public async setVolume(volume: number): Promise<KazagumoPlayer> {
    if (this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, "Player is already destroyed");
    if (isNaN(volume)) throw new KazagumoError(1, "volume must be a number");

    await this.shoukaku.setFilterVolume(volume / 100);

    return this;
  }

  /**
   * Connect to the voice channel
   * @returns KazagumoPlayer
   */
  public connect(): KazagumoPlayer {
    if (this.state === PlayerState.DESTROYED)
      throw new KazagumoError(1, "Player is already destroyed");
    if (this.state === PlayerState.CONNECTED || !!this.voiceId)
      throw new KazagumoError(1, "Player is already connected");
    this.state = PlayerState.CONNECTING;

    this.kazagumo.KazagumoOptions.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: this.voiceId,
        self_mute: false,
        self_deaf: this.options.deaf,
      },
    });

    this.state = PlayerState.CONNECTED;

    this.emit(Events.Debug, `Player ${this.guildId} connected`);

    return this;
  }

  /**
   * Disconnect from the voice channel
   * @returns KazagumoPlayer
   */
  public disconnect(): KazagumoPlayer {
    if (this.state === PlayerState.DISCONNECTED || !this.voiceId)
      throw new KazagumoError(1, "Player is already disconnected");
    this.state = PlayerState.DISCONNECTING;

    this.pause(true);
    this.kazagumo.KazagumoOptions.send(this.guildId, {
      op: 4,
      d: {
        guild_id: this.guildId,
        channel_id: null,
        self_mute: false,
        self_deaf: false,
      },
    });

    this.voiceId = null;
    this.state = PlayerState.DISCONNECTED;

    this.emit(Events.Debug, `Player disconnected; Guild id: ${this.guildId}`);

    return this;
  }

  /**
   * Destroy the player
   * @returns KazagumoPlayer
   */
  async destroy(): Promise<KazagumoPlayer> {
    if (
      this.state === PlayerState.DESTROYING ||
      this.state === PlayerState.DESTROYED
    )
      throw new KazagumoError(1, "Player is already destroyed");

    this.state = PlayerState.DESTROYING;
    this.disconnect();
    await this.kazagumo.shoukaku.leaveVoiceChannel(this.guildId);
    this.kazagumo.players.delete(this.guildId);
    this.state = PlayerState.DESTROYED;

    this.emit(Events.PlayerDestroy, this);
    this.emit(Events.Debug, `Player destroyed; Guild id: ${this.guildId}`);

    return this;
  }

  public async send(data: UpdatePlayerInfo) {
    await this.node.rest.updatePlayer(data);
  }

  public previous() {
    const prevoiusData = this.queue.previous;
    const current = this.queue.current;
    const index = prevoiusData.length - 1;
    if (index === -1 || !current)
      throw new KazagumoError(2, "Previous is empty!");
    this.play(prevoiusData[index]);
    this.queue.previous.splice(index, 1);
  }

  private emit(event: string, ...args: any): void {
    this.kazagumo.emit(event, ...args);
  }
}
