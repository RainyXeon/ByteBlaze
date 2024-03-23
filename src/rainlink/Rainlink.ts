import {
  RainlinkAdditionalOptions,
  RainlinkOptions,
  RainlinkSearchOptions,
  RainlinkSearchResult,
  RainlinkSearchResultType,
} from "./Interface/Manager.js";
import { EventEmitter } from "events";
import { RainlinkNode } from "./Node/RainlinkNode.js";
import { RainlinkVoiceManager } from "./Manager/RainlinkVoiceManager.js";
import { AbstractLibrary } from "./Library/AbstractLibrary.js";
import { VoiceChannelOptions } from "./Interface/Player.js";
import { RainlinkPlayerManager } from "./Manager/RainlinkPlayerManager.js";
import { RainlinkNodeManager } from "./Manager/RainlinkNodeManager.js";
import { LavalinkLoadType, RainlinkEvents, RainlinkPluginType, SourceIDs } from "./Interface/Constants.js";
import { RainlinkTrack } from "./Player/RainlinkTrack.js";
import { RawTrack } from "./Interface/Rest.js";
import { RainlinkPlayer } from "./Player/RainlinkPlayer.js";
import { SourceRainlinkPlugin } from "./Plugin/SourceRainlinkPlugin.js";
import { RainlinkQueue } from "./Player/RainlinkQueue.js";
import { metadata } from "./metadata.js";
import { RainlinkPlugin } from "./Plugin/RainlinkPlugin.js";

export declare interface Rainlink {
  /* tslint:disable:unified-signatures */
  // ------------------------- ON EVENT ------------------------- //
  /**
   * Emitted when rainlink have a debug log.
   * @event Rainlink#debug
   */
  on(event: "debug", listener: (logs: string) => void): this;

  ////// ------------------------- Node Event ------------------------- /////
  /**
   * Emitted when a lavalink server is connected.
   * @event Rainlink#nodeConnect
   */
  on(event: "nodeConnect", listener: (node: RainlinkNode) => void): this;
  /**
   * Emitted when a lavalink server is disconnected.
   * @event Rainlink#nodeDisconnect
   */
  on(event: "nodeDisconnect", listener: (node: RainlinkNode, code: number, reason: Buffer) => void): this;
  /**
   * Emitted when a lavalink server is closed.
   * @event Rainlink#nodeClosed
   */
  on(event: "nodeClosed", listener: (node: RainlinkNode) => void): this;
  /**
   * Emitted when a lavalink server is errored.
   * @event Rainlink#nodeError
   */
  on(event: "nodeError", listener: (node: RainlinkNode, error: Error) => void): this;
  ////// ------------------------- Node Event ------------------------- /////

  ////// ------------------------- Player Event ------------------------- /////
  /**
   * Emitted when a player is created.
   * @event Rainlink#playerCreate
   */
  on(event: "playerCreate", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /**
   * Emitted when a player is going to destroyed.
   * @event Rainlink#playerDestroy
   */
  on(event: "playerDestroy", listener: (player: RainlinkPlayer) => void): this;
  /**
   * Emitted when a player have an exception.
   * @event Rainlink#playerException
   */
  on(event: "playerException", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /**
   * Emitted when a player updated info.
   * @event Rainlink#playerUpdate
   */
  on(event: "playerUpdate", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /**
   * Emitted when a playuer is moved into another channel. [Require plugin]
   * @event Rainlink#playerMoved
   */
  on(
    event: "playerMoved",
    listener: (player: RainlinkPlayer, oldChannelId: string, newChannelId: string) => void
  ): this;
  /**
   * Emitted when a track paused.
   * @event Rainlink#playerPause
   */
  on(event: "playerPause", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /**
   * Emitted when a track resumed.
   * @event Rainlink#playerResume
   */
  on(event: "playerResume", listener: (player: RainlinkPlayer, data: RainlinkTrack) => void): this;
  /**
   * Emitted when a player's websocket closed.
   * @event Rainlink#playerWebsocketClosed
   */
  on(event: "playerWebsocketClosed", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  ////// ------------------------- Player Event ------------------------- /////

  ////// ------------------------- Track Event ------------------------- /////
  /**
   * Emitted when a track is going to play.
   * @event Rainlink#trackStart
   */
  on(event: "trackStart", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /**
   * Emitted when a track is going to end.
   * @event Rainlink#trackEnd
   */
  on(event: "trackEnd", listener: (player: RainlinkPlayer) => void): this;
  /**
   * Emitted when a track stucked.
   * @event Rainlink#trackStuck
   */
  on(event: "trackStuck", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /**
   * Emitted when a track is failed to resolve using fallback search engine.
   * @event Rainlink#trackResolveError
   */
  on(
    event: "trackResolveError",
    listener: (player: RainlinkPlayer, track: RainlinkTrack, message: string) => void
  ): this;
  ////// ------------------------- Track Event ------------------------- /////

  ////// ------------------------- Queue Event ------------------------- /////
  /**
   * Emitted when a track added into queue.
   * @event Rainlink#queueAdd
   */
  on(event: "queueAdd", listener: (player: RainlinkPlayer, queue: RainlinkQueue, track: RainlinkTrack) => void): this;
  /**
   * Emitted when a track removed from queue.
   * @event Rainlink#queueRemove
   */
  on(
    event: "queueRemove",
    listener: (player: RainlinkPlayer, queue: RainlinkQueue, track: RainlinkTrack) => void
  ): this;
  /**
   * Emitted when a queue shuffled.
   * @event Rainlink#queueShuffle
   */
  on(event: "queueShuffle", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  /**
   * Emitted when a queue cleared.
   * @event Rainlink#queueClear
   */
  on(event: "queueClear", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  /**
   * Emitted when a queue is empty.
   * @event Rainlink#queueEmpty
   */
  on(event: "queueEmpty", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  ////// ------------------------- Queue Event ------------------------- /////

  ////// ------------------------- Voice Event ------------------------- /////
  /**
   * Emitted when connected to voice receive server [ONLY Nodelink DRIVER!!!!!!].
   * @event Rainlink#voiceConnect
   */
  on(event: "voiceConnect", listener: (node: RainlinkNode) => void): this;
  /**
   * Emitted when disconnected to voice receive server [ONLY Nodelink DRIVER!!!!!!].
   * @event Rainlink#voiceDisconnect
   */
  on(event: "voiceDisconnect", listener: (node: RainlinkNode, code: number, reason: Buffer) => void): this;
  /**
   * Emitted when voice receive server errored [ONLY Nodelink DRIVER!!!!!!].
   * @event Rainlink#VoiceError
   */
  on(event: "VoiceError", listener: (node: RainlinkNode, error: Error) => void): this;
  /**
   * Emitted when user started speaking [ONLY Nodelink DRIVER!!!!!!].
   * @event Rainlink#voiceStartSpeaking
   */
  on(event: "voiceStartSpeaking", listener: (node: RainlinkNode, userId: string, guildId: string) => void): this;
  /**
   * Emitted when user finished speaking [ONLY Nodelink DRIVER!!!!!!].
   * @event Rainlink#voiceEndSpeaking
   */
  on(
    event: "voiceEndSpeaking",
    listener: (node: RainlinkNode, userTrack: string, userId: string, guildId: string) => void
  ): this;
  ////// ------------------------- Voice Event ------------------------- /////
  // ------------------------- ON EVENT ------------------------- //

  // ------------------------- ONCE EVENT ------------------------- //
  /** @ignore */
  once(event: "debug", listener: (logs: string) => void): this;
  ////// ------------------------- Node Event ------------------------- /////
  /** @ignore */
  once(event: "nodeConnect", listener: (node: RainlinkNode) => void): this;
  /** @ignore */
  once(event: "nodeDisconnect", listener: (node: RainlinkNode, code: number, reason: Buffer) => void): this;
  /** @ignore */
  once(event: "nodeClosed", listener: (node: RainlinkNode) => void): this;
  /** @ignore */
  once(event: "nodeError", listener: (node: RainlinkNode, error: Error) => void): this;
  ////// ------------------------- Node Event ------------------------- /////

  ////// ------------------------- Player Event ------------------------- /////
  /** @ignore */
  once(event: "playerCreate", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /** @ignore */
  once(event: "playerDestroy", listener: (player: RainlinkPlayer) => void): this;
  /** @ignore */
  once(event: "playerException", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /** @ignore */
  once(event: "playerUpdate", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /** @ignore */
  once(
    event: "playerMoved",
    listener: (player: RainlinkPlayer, oldChannelId: string, newChannelId: string) => void
  ): this;
  /** @ignore */
  once(event: "playerPause", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /** @ignore */
  once(event: "playerResume", listener: (player: RainlinkPlayer, data: RainlinkTrack) => void): this;
  /** @ignore */
  once(event: "playerWebsocketClosed", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  ////// ------------------------- Player Event ------------------------- /////

  ////// ------------------------- Track Event ------------------------- /////
  /** @ignore */
  once(event: "trackStart", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /** @ignore */
  once(event: "trackEnd", listener: (player: RainlinkPlayer) => void): this;
  /** @ignore */
  once(event: "trackStuck", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /** @ignore */
  once(
    event: "trackResolveError",
    listener: (player: RainlinkPlayer, track: RainlinkTrack, message: string) => void
  ): this;
  ////// ------------------------- Track Event ------------------------- /////

  ////// ------------------------- Queue Event ------------------------- /////
  /** @ignore */
  once(event: "queueAdd", listener: (player: RainlinkPlayer, queue: RainlinkQueue, track: RainlinkTrack) => void): this;
  /** @ignore */
  once(
    event: "queueRemove",
    listener: (player: RainlinkPlayer, queue: RainlinkQueue, track: RainlinkTrack) => void
  ): this;
  /** @ignore */
  once(event: "queueShuffle", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  /** @ignore */
  once(event: "queueClear", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  /** @ignore */
  once(event: "queueEmpty", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  ////// ------------------------- Queue Event ------------------------- /////

  ////// ------------------------- Voice Event ------------------------- /////
  /** @ignore */
  once(event: "voiceConnect", listener: (node: RainlinkNode) => void): this;
  /** @ignore */
  once(event: "voiceDisconnect", listener: (node: RainlinkNode, code: number, reason: Buffer) => void): this;
  /** @ignore */
  once(event: "VoiceError", listener: (node: RainlinkNode, error: Error) => void): this;
  /** @ignore */
  once(event: "voiceStartSpeaking", listener: (node: RainlinkNode, userId: string, guildId: string) => void): this;
  /** @ignore */
  once(
    event: "voiceEndSpeaking",
    listener: (node: RainlinkNode, userTrack: string, userId: string, guildId: string) => void
  ): this;
  ////// ------------------------- Voice Event ------------------------- /////
  // ------------------------- ONCE EVENT ------------------------- //

  // ------------------------- OFF EVENT ------------------------- //
  /** @ignore */
  off(event: "debug", listener: (logs: string) => void): this;
  ////// ------------------------- Node Event ------------------------- /////
  /** @ignore */
  off(event: "nodeConnect", listener: (node: RainlinkNode) => void): this;
  /** @ignore */
  off(event: "nodeDisconnect", listener: (node: RainlinkNode, code: number, reason: Buffer) => void): this;
  /** @ignore */
  off(event: "nodeClosed", listener: (node: RainlinkNode) => void): this;
  /** @ignore */
  off(event: "nodeError", listener: (node: RainlinkNode, error: Error) => void): this;
  ////// ------------------------- Node Event ------------------------- /////

  ////// ------------------------- Player Event ------------------------- /////
  /** @ignore */
  off(event: "playerCreate", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /** @ignore */
  off(event: "playerDestroy", listener: (player: RainlinkPlayer) => void): this;
  /** @ignore */
  off(event: "playerException", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /** @ignore */
  off(event: "playerUpdate", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /** @ignore */
  off(
    event: "playerMoved",
    listener: (player: RainlinkPlayer, oldChannelId: string, newChannelId: string) => void
  ): this;
  /** @ignore */
  off(event: "playerPause", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /** @ignore */
  off(event: "playerResume", listener: (player: RainlinkPlayer, data: RainlinkTrack) => void): this;
  /** @ignore */
  off(event: "playerWebsocketClosed", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  ////// ------------------------- Player Event ------------------------- /////

  ////// ------------------------- Track Event ------------------------- /////
  /** @ignore */
  off(event: "trackStart", listener: (player: RainlinkPlayer, track: RainlinkTrack) => void): this;
  /** @ignore */
  off(event: "trackEnd", listener: (player: RainlinkPlayer) => void): this;
  /** @ignore */
  off(event: "trackStuck", listener: (player: RainlinkPlayer, data: Record<string, any>) => void): this;
  /** @ignore */
  off(
    event: "trackResolveError",
    listener: (player: RainlinkPlayer, track: RainlinkTrack, message: string) => void
  ): this;
  ////// ------------------------- Track Event ------------------------- /////

  ////// ------------------------- Queue Event ------------------------- /////
  /** @ignore */
  off(event: "queueAdd", listener: (player: RainlinkPlayer, queue: RainlinkQueue, track: RainlinkTrack) => void): this;
  /** @ignore */
  off(
    event: "queueRemove",
    listener: (player: RainlinkPlayer, queue: RainlinkQueue, track: RainlinkTrack) => void
  ): this;
  /** @ignore */
  off(event: "queueShuffle", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  /** @ignore */
  off(event: "queueClear", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  /** @ignore */
  off(event: "queueEmpty", listener: (player: RainlinkPlayer, queue: RainlinkQueue) => void): this;
  ////// ------------------------- Queue Event ------------------------- /////

  ////// ------------------------- Voice Event ------------------------- /////
  /** @ignore */
  off(event: "voiceConnect", listener: (node: RainlinkNode) => void): this;
  /** @ignore */
  off(event: "voiceDisconnect", listener: (node: RainlinkNode, code: number, reason: Buffer) => void): this;
  /** @ignore */
  off(event: "VoiceError", listener: (node: RainlinkNode, error: Error) => void): this;
  /** @ignore */
  off(event: "voiceStartSpeaking", listener: (node: RainlinkNode, userId: string, guildId: string) => void): this;
  /** @ignore */
  off(
    event: "voiceEndSpeaking",
    listener: (node: RainlinkNode, userTrack: string, userId: string, guildId: string) => void
  ): this;
  ////// ------------------------- Voice Event ------------------------- /////
  // ------------------------- OFF EVENT ------------------------- //
}

export class Rainlink extends EventEmitter {
  /**
   * Discord library connector
   */
  public readonly library: AbstractLibrary;
  /**
   * Voice voice managers being handled
   */
  public readonly voiceManagers: Map<string, RainlinkVoiceManager>;
  /**
   * Lavalink server that has been configured
   */
  public nodes: RainlinkNodeManager;
  /**
   * Rainlink options
   */
  public rainlinkOptions: RainlinkOptions;
  /**
   * Bot id
   */
  public id: string | undefined;
  /**
   * Player maps
   */
  public players: RainlinkPlayerManager;
  /**
   * All search engine
   */
  public searchEngines: Map<string, string>;
  /**
   * All search plugins (resolver plugins)
   */
  public searchPlugins: Map<string, SourceRainlinkPlugin>;
  /**
   * All plugins (include resolver plugins)
   */
  public plugins: Map<string, RainlinkPlugin>;

  /**
   * The main class that handle all works in lavalink server.
   * Call this class by using new Rainlink(your_params) to use!
   * @param options The main ranlink options
   */
  constructor(options: RainlinkOptions) {
    super();
    this.debug("Start the client.");
    if (!options.library)
      throw new Error("Please set an new lib to connect, example: \nlibrary: new Library.DiscordJS(client) ");
    this.library = options.library.set(this);
    this.rainlinkOptions = options;
    this.rainlinkOptions.options = this.mergeDefaultOptions(this.rainlinkOptions.options ?? {});
    this.voiceManagers = new Map();
    this.nodes = new RainlinkNodeManager(this);
    this.library.listen(this.rainlinkOptions.nodes);
    this.players = new RainlinkPlayerManager(this, this.voiceManagers);
    this.searchEngines = new Map<string, string>();
    this.searchPlugins = new Map<string, SourceRainlinkPlugin>();
    this.plugins = new Map<string, RainlinkPlugin>();
    this.initialSearchEngines();
    if (
      !this.rainlinkOptions.options.defaultSearchEngine ||
      this.rainlinkOptions.options.defaultSearchEngine.length == 0
    )
      this.rainlinkOptions.options.defaultSearchEngine == "youtube";

    if (this.rainlinkOptions.plugins) {
      for (const [, plugin] of this.rainlinkOptions.plugins.entries()) {
        if (plugin.constructor.name !== "RainlinkPlugin")
          throw new Error("Plugin must be an instance of RainlinkPlugin or SourceRainlinkPlugin");
        plugin.load(this);

        this.plugins.set(plugin.name(), plugin);

        if (plugin.type() == RainlinkPluginType.SourceResolver) {
          const newPlugin = plugin as SourceRainlinkPlugin;
          const sourceName = newPlugin.sourceName();
          const sourceIdentify = newPlugin.sourceIdentify();
          this.searchEngines.set(sourceName, sourceIdentify);
          this.searchPlugins.set(sourceName, newPlugin);
        }
      }
      this.debug(`Registered ${this.rainlinkOptions.plugins.length} plugins, including ${this.searchPlugins.size}`);
    }
  }

  /** @ignore */
  protected initialSearchEngines() {
    for (const data of SourceIDs) {
      this.searchEngines.set(data.name, data.id);
    }
  }

  /**
   * Create a new player.
   * @returns RainlinkNode
   */
  async create(options: VoiceChannelOptions): Promise<RainlinkPlayer> {
    return await this.players.create(options);
  }

  /**
   * Destroy a specific player.
   * @returns void
   */
  async destroy(guildId: string): Promise<void> {
    this.players.destroy(guildId);
  }

  /**
   * Search a specific track.
   * @returns RainlinkSearchResult
   */
  async search(query: string, options?: RainlinkSearchOptions): Promise<RainlinkSearchResult> {
    const node =
      options && options?.nodeName
        ? this.nodes.get(options.nodeName) ?? (await this.nodes.getLeastUsed())
        : await this.nodes.getLeastUsed();

    if (!node) throw new Error("No node is available");

    let pluginData: RainlinkSearchResult;

    const directSearchRegex = /directSearch=(.*)/;
    const isDirectSearch = directSearchRegex.exec(query);
    const isUrl = /^https?:\/\/.*/.test(query);

    const pluginSearch = this.searchPlugins.get(String(options?.engine));

    if (options && options!.engine && options!.engine !== null && pluginSearch && isDirectSearch == null) {
      pluginData = await pluginSearch.searchDirect(query, options);
      if (pluginData.tracks.length !== 0) return pluginData;
    }

    const source =
      options && options?.engine
        ? this.searchEngines.get(options.engine)
        : this.searchEngines.get(
            this.rainlinkOptions.options!.defaultSearchEngine
              ? this.rainlinkOptions.options!.defaultSearchEngine
              : "youtube"
          );

    const finalQuery = isDirectSearch !== null ? isDirectSearch[1] : !isUrl ? `${source}search:${query}` : query;

    const result = await node.rest.resolver(finalQuery).catch(() => null);
    if (!result || result.loadType === LavalinkLoadType.EMPTY) {
      return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
    }

    let loadType: RainlinkSearchResultType;
    let normalizedData: {
      playlistName?: string;
      tracks: RawTrack[];
    } = { tracks: [] };
    switch (result.loadType) {
      case LavalinkLoadType.TRACK: {
        loadType = RainlinkSearchResultType.TRACK;
        normalizedData.tracks = [result.data];
        break;
      }

      case LavalinkLoadType.PLAYLIST: {
        loadType = RainlinkSearchResultType.PLAYLIST;
        normalizedData = {
          playlistName: result.data.info.name,
          tracks: result.data.tracks,
        };
        break;
      }

      case LavalinkLoadType.SEARCH: {
        loadType = RainlinkSearchResultType.SEARCH;
        normalizedData.tracks = result.data;
        break;
      }

      default: {
        loadType = RainlinkSearchResultType.SEARCH;
        normalizedData.tracks = [];
        break;
      }
    }

    this.debug(`Searched ${query}; Track results: ${normalizedData.tracks.length}`);

    return this.buildSearch(
      normalizedData.playlistName ?? undefined,
      normalizedData.tracks.map(
        (track) => new RainlinkTrack(track, options && options.requester ? options.requester : undefined)
      ),
      loadType
    );
  }

  /** @ignore */
  protected buildSearch(
    playlistName?: string,
    tracks: RainlinkTrack[] = [],
    type?: RainlinkSearchResultType
  ): RainlinkSearchResult {
    return {
      playlistName,
      tracks,
      type: type ?? RainlinkSearchResultType.SEARCH,
    };
  }

  /** @ignore */
  protected debug(logs: string) {
    this.emit(RainlinkEvents.Debug, `[Rainlink]: ${logs}`);
  }

  /** @ignore */
  protected mergeDefaultOptions(data: RainlinkAdditionalOptions): RainlinkAdditionalOptions {
    return {
      retryTimeout: data.retryTimeout ?? 3000,
      retryCount: data.retryCount ?? 15,
      voiceConnectionTimeout: data.voiceConnectionTimeout ?? 15000,
      defaultSearchEngine: data.defaultSearchEngine ?? undefined,
      defaultVolume: data.defaultVolume ?? 100,
      searchFallback: data.searchFallback
        ? {
            enable: data.searchFallback.enable == true ? true : false,
            engine:
              data.searchFallback.engine !== null && data.searchFallback.engine !== undefined
                ? data.searchFallback.engine
                : "soundcloud",
          }
        : {
            enable: false,
            engine: "soundcloud",
          },
      resume: data.resume ?? false,
      userAgent: data.userAgent ?? `Discord/Bot/${metadata.name}/${metadata.version} (${metadata.github})`,
      nodeResolver: data.nodeResolver ?? undefined,
      structures: {
        player: data.structures && data.structures.player ? data.structures.player : undefined,
        rest: data.structures && data.structures.rest ? data.structures.rest : undefined,
      },
      resumeTimeout: data.resumeTimeout ?? 300,
    };
  }
}
