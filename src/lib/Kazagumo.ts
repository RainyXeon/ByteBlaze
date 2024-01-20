/**
 * All the code below is from kazagumo.mod
 * An edited version is retrieved from
 * https://github.com/Takiyo0/Kazagumo/tree/d118eaf22559bd3f2159e2e147a67876d3986669
 * Original developer: Takiyo0 (Github)
 * Mod developer: RainyXeon (Github)
 * Special thanks to Takiyo0 (Github)
 */

import { EventEmitter } from "events";
import {
  CreatePlayerOptions,
  Events,
  KazagumoError,
  KazagumoOptions as KazagumoOptionsOwO,
  KazagumoSearchOptions,
  KazagumoSearchResult,
  PlayerMovedChannels,
  PlayerMovedState,
  SearchResultTypes,
  SourceIDs,
  State,
  VoiceState,
} from "./Modules/Interfaces.js";
import {
  Connection,
  Connector,
  LoadType,
  Node,
  NodeOption,
  Player,
  PlayerUpdate,
  Shoukaku,
  ShoukakuOptions,
  Track,
  TrackExceptionEvent,
  TrackStuckEvent,
  VoiceChannelOptions,
  WebSocketClosedEvent,
} from "shoukaku";

import { KazagumoPlayer } from "./Managers/KazagumoPlayer.js";
import { KazagumoTrack } from "./Managers/Supports/KazagumoTrack.js";
import { Snowflake } from "discord.js";
import { KazagumoQueue } from "./Managers/Supports/KazagumoQueue.js";

export declare interface Kazagumo {
  /* tslint:disable:unified-signatures */
  /**
   * Emitted when a track is going to play.
   * @event Kazagumo#playerStart
   */
  on(
    event: "playerStart",
    listener: (player: KazagumoPlayer, track: KazagumoTrack) => void
  ): this;

  /**
   * Emitted when an error occured while resolving track.
   * @event Kazagumo#playerResolveError
   */
  on(
    event: "playerResolveError",
    listener: (
      player: KazagumoPlayer,
      track: KazagumoTrack,
      message?: string
    ) => void
  ): this;

  /**
   * Emitted when a player got destroyed.
   * @event Kazagumo#playerDestroy
   */
  on(event: "playerDestroy", listener: (player: KazagumoPlayer) => void): this;

  /**
   * Emitted when a player created.
   * @event Kazagumo#playerCreate
   */
  on(event: "playerCreate", listener: (player: KazagumoPlayer) => void): this;

  /**
   * Emitted when a track ended.
   * @event Kazagumo#playerEnd
   */
  on(event: "playerEnd", listener: (player: KazagumoPlayer) => void): this;

  /**
   * Emitted when a player got empty.
   * @event Kazagumo#playerEmpty
   */
  on(event: "playerEmpty", listener: (player: KazagumoPlayer) => void): this;

  /**
   * Emitted when a player got closed.
   * @event Kazagumo#playerClosed
   */
  on(
    event: "playerClosed",
    listener: (player: KazagumoPlayer, data: WebSocketClosedEvent) => void
  ): this;

  /**
   * Emitted when a player got stuck.
   * @event Kazagumo#playerStuck
   */
  on(
    event: "playerStuck",
    listener: (player: KazagumoPlayer, data: TrackStuckEvent) => void
  ): this;

  /**
   * Emitted when a player got resumed.
   * @event Kazagumo#playerResumed
   */
  on(event: "playerResumed", listener: (player: KazagumoPlayer) => void): this;

  /**
   * Emitted only when you use playerMoved plugin and when the bot moved, joined, or left voice channel.
   * @event Kazagumo#playerMoved
   */
  on(
    event: "playerMoved",
    listener: (
      player: KazagumoPlayer,
      state: PlayerMovedState,
      channels: PlayerMovedChannels
    ) => void
  ): this;

  /**
   * Emitted when an exception occured.
   * @event Kazagumo#playerException
   */
  on(
    event: "playerException",
    listener: (player: KazagumoPlayer, data: TrackExceptionEvent) => void
  ): this;

  /**
   * Emitted when a player updated.
   * @event Kazagumo#playerUpdate
   */
  on(
    event: "playerUpdate",
    listener: (player: KazagumoPlayer, data: PlayerUpdate) => void
  ): this;

  /**
   * Emitted for science purpose.
   * @event Kazagumo#playerUpdate
   */
  on(event: "playerUpdate", listener: (data: unknown) => void): this;

  on(event: "playerResume", listener: (player: KazagumoPlayer) => void): this;
  on(event: "playerPause", listener: (player: KazagumoPlayer) => void): this;

  /**
   * Emitted when a queue updated (track added, changed, etc).
   * @event Kazagumo#queueUpdate
   */
  on(
    event: "queueUpdate",
    listener: (player: KazagumoPlayer, queue: KazagumoQueue) => void
  ): this;

  once(
    event: "playerStart",
    listener: (player: KazagumoPlayer, track: KazagumoTrack) => void
  ): this;
  once(
    event: "playerResolveError",
    listener: (
      player: KazagumoPlayer,
      track: KazagumoTrack,
      message?: string
    ) => void
  ): this;
  once(
    event: "playerDestroy",
    listener: (player: KazagumoPlayer) => void
  ): this;
  once(event: "playerCreate", listener: (player: KazagumoPlayer) => void): this;
  once(event: "playerEnd", listener: (player: KazagumoPlayer) => void): this;
  once(event: "playerEmpty", listener: (player: KazagumoPlayer) => void): this;
  once(
    event: "playerClosed",
    listener: (player: KazagumoPlayer, data: WebSocketClosedEvent) => void
  ): this;
  once(
    event: "playerStuck",
    listener: (player: KazagumoPlayer, data: TrackStuckEvent) => void
  ): this;
  once(
    event: "playerResumed",
    listener: (player: KazagumoPlayer) => void
  ): this;
  once(
    event: "playerMoved",
    listener: (
      player: KazagumoPlayer,
      state: PlayerMovedState,
      channels: PlayerMovedChannels
    ) => void
  ): this;
  once(
    event: "playerException",
    listener: (player: KazagumoPlayer, data: TrackExceptionEvent) => void
  ): this;
  once(
    event: "playerUpdate",
    listener: (player: KazagumoPlayer, data: PlayerUpdate) => void
  ): this;
  once(event: "playerUpdate", listener: (data: unknown) => void): this;
  once(event: "playerResume", listener: (player: KazagumoPlayer) => void): this;
  once(event: "playerPause", listener: (player: KazagumoPlayer) => void): this;
  once(
    event: "queueUpdate",
    listener: (player: KazagumoPlayer, queue: KazagumoQueue) => void
  ): this;

  off(
    event: "playerStart",
    listener: (player: KazagumoPlayer, track: KazagumoTrack) => void
  ): this;
  off(
    event: "playerResolveError",
    listener: (
      player: KazagumoPlayer,
      track: KazagumoTrack,
      message?: string
    ) => void
  ): this;
  off(event: "playerDestroy", listener: (player: KazagumoPlayer) => void): this;
  off(event: "playerCreate", listener: (player: KazagumoPlayer) => void): this;
  off(event: "playerEnd", listener: (player: KazagumoPlayer) => void): this;
  off(event: "playerEmpty", listener: (player: KazagumoPlayer) => void): this;
  off(
    event: "playerClosed",
    listener: (player: KazagumoPlayer, data: WebSocketClosedEvent) => void
  ): this;
  off(
    event: "playerStuck",
    listener: (player: KazagumoPlayer, data: TrackStuckEvent) => void
  ): this;
  off(event: "playerResumed", listener: (player: KazagumoPlayer) => void): this;
  off(
    event: "playerMoved",
    listener: (
      player: KazagumoPlayer,
      state: PlayerMovedState,
      channels: PlayerMovedChannels
    ) => void
  ): this;
  off(
    event: "playerException",
    listener: (player: KazagumoPlayer, data: TrackExceptionEvent) => void
  ): this;
  off(
    event: "playerUpdate",
    listener: (player: KazagumoPlayer, data: PlayerUpdate) => void
  ): this;
  off(event: "playerUpdate", listener: (data: unknown) => void): this;
  off(event: "playerResume", listener: (player: KazagumoPlayer) => void): this;
  off(event: "playerPause", listener: (player: KazagumoPlayer) => void): this;
  off(
    event: "queueUpdate",
    listener: (player: KazagumoPlayer, queue: KazagumoQueue) => void
  ): this;
}

export class Kazagumo extends EventEmitter {
  /** Shoukaku instance */
  public shoukaku: Shoukaku;
  /** Kazagumo players */
  public readonly players: Map<string, KazagumoPlayer> = new Map();

  /**
   * Initialize a Kazagumo instance.
   * @param KazagumoOptions KazagumoOptions
   * @param connector Connector
   * @param nodes NodeOption[]
   * @param options ShoukakuOptions
   */
  constructor(
    public KazagumoOptions: KazagumoOptionsOwO,
    connector: Connector,
    nodes: NodeOption[],
    options: ShoukakuOptions = {}
  ) {
    super();

    this.shoukaku = new Shoukaku(connector, nodes, options);

    if (this.KazagumoOptions.plugins) {
      for (const [, plugin] of this.KazagumoOptions.plugins.entries()) {
        if (plugin.constructor.name !== "KazagumoPlugin")
          throw new KazagumoError(
            1,
            "Plugin must be an instance of KazagumoPlugin"
          );
        plugin.load(this);
      }
    }

    this.players = new Map<string, KazagumoPlayer>();
  }

  // Modified version of Shoukaku#joinVoiceChannel
  // Credit to @deivu
  protected async createVoiceConnection(
    newPlayerOptions: VoiceChannelOptions,
    kazagumoPlayerOptions: CreatePlayerOptions
  ): Promise<Player> {
    if (
      this.shoukaku.connections.has(newPlayerOptions.guildId) &&
      this.shoukaku.players.has(newPlayerOptions.guildId)
    )
      return this.shoukaku.players.get(newPlayerOptions.guildId)!;
    if (
      this.shoukaku.connections.has(newPlayerOptions.guildId) &&
      !this.shoukaku.players.has(newPlayerOptions.guildId)
    ) {
      this.shoukaku.connections.get(newPlayerOptions.guildId)!.disconnect();
      throw new KazagumoError(
        4,
        "Connection exist but player not found. Destroying connection..."
      );
    }

    const connection = new Connection(this.shoukaku, newPlayerOptions);
    this.shoukaku.connections.set(connection.guildId, connection);
    try {
      await connection.connect();
    } catch (error) {
      this.shoukaku.connections.delete(newPlayerOptions.guildId);
      throw error;
    }
    try {
      let node;
      if (kazagumoPlayerOptions.loadBalancer)
        node = await this.getLeastUsedNode();
      else if (kazagumoPlayerOptions.nodeName)
        node =
          this.shoukaku.nodes.get(kazagumoPlayerOptions.nodeName) ??
          (await this.getLeastUsedNode());
      else node = this.shoukaku.options.nodeResolver(this.shoukaku.nodes);
      if (!node) throw new KazagumoError(3, "No node found");

      const player = this.shoukaku.options.structures.player
        ? new this.shoukaku.options.structures.player(connection.guildId, node)
        : new Player(connection.guildId, node);
      const onUpdate = (state: VoiceState) => {
        if (state !== VoiceState.SESSION_READY) return;
        player.sendServerUpdate(connection);
      };
      await player.sendServerUpdate(connection);
      connection.on("connectionUpdate", onUpdate);
      this.shoukaku.players.set(player.guildId, player);
      return player;
    } catch (error) {
      connection.disconnect();
      this.shoukaku.connections.delete(newPlayerOptions.guildId);
      throw error;
    }
  }

  /**
   * Create a player.
   * @param options CreatePlayerOptions
   * @returns Promise<KazagumoPlayer>
   */
  public async createPlayer<T extends KazagumoPlayer>(
    options: CreatePlayerOptions
  ): Promise<T | KazagumoPlayer> {
    const exist = this.players.get(options.guildId);
    if (exist) return exist;

    let node;
    if (options.loadBalancer) node = this.getLeastUsedNode();
    else if (options.nodeName)
      node =
        this.shoukaku.nodes.get(options.nodeName) ?? this.getLeastUsedNode();
    else node = this.shoukaku.options.nodeResolver(this.shoukaku.nodes);

    if (!options.deaf) options.deaf = false;
    if (!options.mute) options.mute = false;

    if (!node) throw new KazagumoError(3, "No node found");

    const shoukakuPlayer = await this.createVoiceConnection(
      {
        guildId: options.guildId as string,
        channelId: options.voiceId as string,
        deaf: options.deaf,
        mute: options.mute,
        shardId:
          options.shardId && !isNaN(options.shardId) ? options.shardId : 0,
      },
      options
    );

    const kazagumoPlayer = new (this.KazagumoOptions.extends?.player ??
      KazagumoPlayer)(
      this,
      shoukakuPlayer,
      {
        guildId: options.guildId,
        voiceId: options.voiceId,
        textId: options.textId,
        deaf: options.deaf,
        volume: isNaN(Number(options.volume))
          ? 100
          : (options.volume as number),
      },
      options.data
    );
    this.players.set(options.guildId, kazagumoPlayer);
    this.emit(Events.PlayerCreate, kazagumoPlayer);
    return kazagumoPlayer;
  }

  /**
   * Get a player by guildId.
   * @param guildId Guild ID
   * @returns KazagumoPlayer | undefined
   */
  public getPlayer<T extends KazagumoPlayer>(
    guildId: Snowflake
  ): (T | KazagumoPlayer) | undefined {
    return this.players.get(guildId);
  }

  /**
   * Destroy a player.
   * @param guildId Guild ID
   * @returns void
   */
  public destroyPlayer<T extends KazagumoPlayer>(guildId: Snowflake): void {
    const player = this.getPlayer<T>(guildId);
    if (!player) return;
    player.destroy();
    this.players.delete(guildId);
  }

  /**
   * Get a least used node.
   * @returns Node
   */
  public async getLeastUsedNode(): Promise<Node> {
    const nodes: Node[] = [...this.shoukaku.nodes.values()];

    const onlineNodes = nodes.filter((node) => node.state === State.CONNECTED);
    // tslint:disable-next-line:no-console
    if (!onlineNodes.length) throw new KazagumoError(2, "No nodes are online");

    const temp = await Promise.all(
      onlineNodes.map(async (node) => ({
        node,
        players: (await node.rest.getPlayers())
          .filter((x) => this.players.get(x.guildId))
          .map((x) => this.players.get(x.guildId)!)
          .filter((x) => x.shoukaku.node.name === node.name).length,
      }))
    );

    return temp.reduce((a, b) => (a.players < b.players ? a : b)).node;
  }

  /**
   * Search a track by query or uri.
   * @param query Query
   * @param options KazagumoOptions
   * @returns Promise<KazagumoSearchResult>
   */
  public async search(
    query: string,
    options?: KazagumoSearchOptions
  ): Promise<KazagumoSearchResult> {
    const node = options?.nodeName
      ? this.shoukaku.nodes.get(options.nodeName) ??
        (await this.getLeastUsedNode())
      : await this.getLeastUsedNode();
    if (!node) throw new KazagumoError(3, "No node is available");

    const source = (SourceIDs as any)[
      (options?.engine &&
      ["youtube", "youtube_music", "soundcloud"].includes(options.engine)
        ? options.engine
        : null) ||
        (!!this.KazagumoOptions.defaultSearchEngine &&
        ["youtube", "youtube_music", "soundcloud"].includes(
          this.KazagumoOptions.defaultSearchEngine!
        )
          ? this.KazagumoOptions.defaultSearchEngine
          : null) ||
        "youtube"
    ];

    const isUrl = /^https?:\/\/.*/.test(query);

    const result = await node.rest
      .resolve(!isUrl ? `${source}search:${query}` : query)
      .catch((_) => null);
    if (!result || result.loadType === LoadType.EMPTY)
      return this.buildSearch(undefined, [], "SEARCH");

    let loadType: SearchResultTypes;
    let normalizedData: {
      playlistName?: string;
      tracks: Track[];
    } = { tracks: [] };
    switch (result.loadType) {
      case LoadType.TRACK: {
        loadType = "TRACK";
        normalizedData.tracks = [result.data];
        break;
      }

      case LoadType.PLAYLIST: {
        loadType = "PLAYLIST";
        normalizedData = {
          playlistName: result.data.info.name,
          tracks: result.data.tracks,
        };
        break;
      }

      case LoadType.SEARCH: {
        loadType = "SEARCH";
        normalizedData.tracks = result.data;
        break;
      }

      default: {
        loadType = "SEARCH";
        normalizedData.tracks = [];
        break;
      }
    }
    this.emit(
      Events.Debug,
      `Searched ${query}; Track results: ${normalizedData.tracks.length}`
    );

    return this.buildSearch(
      normalizedData.playlistName ?? undefined,
      normalizedData.tracks.map(
        (track) => new KazagumoTrack(track, options?.requester)
      ),
      loadType
    );
  }

  private buildSearch(
    playlistName?: string,
    tracks: KazagumoTrack[] = [],
    type?: SearchResultTypes
  ): KazagumoSearchResult {
    return {
      playlistName,
      tracks,
      type: type ?? "SEARCH",
    };
  }
}
