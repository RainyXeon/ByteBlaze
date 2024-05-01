import { RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkSearchResult, RainlinkSearchResultType } from "../Interface/Manager.js";
import { RawTrack } from "../Interface/Rest.js";
import { ResolveOptions } from "../Interface/Track.js";
import { Rainlink } from "../Rainlink.js";
import { RainlinkNode } from "../main.js";

export class RainlinkTrack {
  /** Encoded string from lavalink */
  encoded: string;
  /** Identifier string from lavalink */
  identifier: string;
  /** Whenever track is seekable or not */
  isSeekable: boolean;
  /** Track's author */
  author: string;
  /** Track's duration */
  duration: number;
  /** Whenever track is stream able or not */
  isStream: boolean;
  /** Track's position */
  position: number;
  /** Track's title */
  title: string;
  /** Track's URL */
  uri?: string;
  /** Track's artwork URL */
  artworkUrl?: string;
  /** Track's isrc */
  isrc?: string;
  /** Track's source name */
  source: string;
  /** Data from lavalink plugin */
  pluginInfo: unknown;
  /** Track's requester */
  requester: unknown;
  /** Track's realUri (youtube fall back) */
  realUri?: string;

  /**
   * The rainlink track class for playing track from lavalink
   * @param options The raw track resolved from rest, use RawTrack interface
   * @param requester The requester details of this track
   */
  constructor(
    protected options: RawTrack,
    requester: unknown
  ) {
    this.encoded = options.encoded;
    this.identifier = options.info.identifier;
    this.isSeekable = options.info.isSeekable;
    this.author = options.info.author;
    this.duration = options.info.length;
    this.isStream = options.info.isStream;
    this.position = options.info.position;
    this.title = options.info.title;
    this.uri = options.info.uri;
    this.artworkUrl = options.info.artworkUrl;
    this.isrc = options.info.isrc;
    this.source = options.info.sourceName;
    this.pluginInfo = options.pluginInfo;
    this.requester = requester;
    this.realUri = undefined;
  }

  /**
   * Whenever track is able to play or not
   * @returns boolean
   */
  get isPlayable(): boolean {
    return (
      !!this.encoded &&
      !!this.source &&
      !!this.identifier &&
      !!this.author &&
      !!this.duration &&
      !!this.title &&
      !!this.uri
    );
  }

  /**
   * Get all raw details of the track
   * @returns RawTrack
   */
  get raw(): RawTrack {
    return {
      encoded: this.encoded,
      info: {
        identifier: this.identifier,
        isSeekable: this.isSeekable,
        author: this.author,
        length: this.duration,
        isStream: this.isStream,
        position: this.position,
        title: this.title,
        uri: this.uri,
        artworkUrl: this.artworkUrl,
        isrc: this.isrc,
        sourceName: this.source,
      },
      pluginInfo: this.pluginInfo,
    };
  }

  /**
   * Resolve the track
   * @param options Resolve options
   * @returns Promise<RainlinkTrack>
   */
  public async resolver(manager: Rainlink, options?: ResolveOptions): Promise<RainlinkTrack> {
    const { overwrite } = options ? options : { overwrite: false };

    if (this.isPlayable) {
      this.realUri = this.raw.info.uri;
      return this;
    }

    manager.emit(
      RainlinkEvents.Debug,
      `[Rainlink] / [Track] | Resolving ${this.source} track ${this.title}; Source: ${this.source}`
    );

    const result = await this.getTrack(manager, options ? options.nodeName : undefined);
    if (!result) throw new Error("No results found");

    this.encoded = result.encoded;
    this.realUri = result.info.uri;
    this.duration = result.info.length;

    if (overwrite) {
      this.title = result.info.title;
      this.identifier = result.info.identifier;
      this.isSeekable = result.info.isSeekable;
      this.author = result.info.author;
      this.duration = result.info.length;
      this.isStream = result.info.isStream;
      this.uri = result.info.uri;
    }
    return this;
  }

  protected async getTrack(manager: Rainlink, nodeName?: string): Promise<RawTrack> {
    const node = nodeName ? manager.nodes.get(nodeName) : await manager.nodes.getLeastUsed();

    if (!node) throw new Error("No nodes available");

    const result = await this.resolverEngine(manager, node);

    if (!result || !result.tracks.length) throw new Error("No results found");

    const rawTracks = result.tracks.map((x) => x.raw);

    if (this.author) {
      const author = [this.author, `${this.author} - Topic`];
      const officialTrack = rawTracks.find(
        (track) =>
          author.some((name) => new RegExp(`^${this.escapeRegExp(name)}$`, "i").test(track.info.author)) ||
          new RegExp(`^${this.escapeRegExp(this.title)}$`, "i").test(track.info.title)
      );
      if (officialTrack) return officialTrack;
    }
    if (this.duration) {
      const sameDuration = rawTracks.find(
        (track) =>
          track.info.length >= (this.duration ? this.duration : 0) - 2000 &&
          track.info.length <= (this.duration ? this.duration : 0) + 2000
      );
      if (sameDuration) return sameDuration;
    }

    return rawTracks[0];
  }

  protected escapeRegExp(string: string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  protected async resolverEngine(manager: Rainlink, node: RainlinkNode): Promise<RainlinkSearchResult> {
    const defaultSearchEngine = manager.rainlinkOptions.options!.defaultSearchEngine;
    const engine = manager.searchEngines.get(this.source || defaultSearchEngine || "youtube");
    const searchQuery = [this.author, this.title].filter((x) => !!x).join(" - ");
    const searchFallbackEngineName = manager.rainlinkOptions.options!.searchFallback!.engine;
    const searchFallbackEngine = manager.searchEngines.get(searchFallbackEngineName);

    const prase1 = await manager.search(`directSearch=${this.uri}`, {
      requester: this.requester,
      nodeName: node.options.name,
    });
    if (prase1.tracks.length !== 0) return prase1;

    const prase2 = await manager.search(`directSearch=${engine}search:${searchQuery}`, {
      requester: this.requester,
      nodeName: node.options.name,
    });
    if (prase2.tracks.length !== 0) return prase2;

    if (manager.rainlinkOptions.options!.searchFallback?.enable && searchFallbackEngine) {
      const prase3 = await manager.search(`directSearch=${searchFallbackEngine}search:${searchQuery}`, {
        requester: this.requester,
        nodeName: node.options.name,
      });
      if (prase3.tracks.length !== 0) return prase3;
    }

    return {
      type: RainlinkSearchResultType.SEARCH,
      playlistName: undefined,
      tracks: [],
    };
  }
}
