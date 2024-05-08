import { RainlinkEvents, RainlinkPluginType } from "../../main.js";
import { RainlinkSearchOptions, RainlinkSearchResult, RainlinkSearchResultType } from "../../main.js";
import { RainlinkTrack } from "../../main.js";
import { Rainlink } from "../../main.js";
import { SourceRainlinkPlugin } from "../../main.js";
import NicoResolver from "./NicoResolver.js";
import search from "./NicoSearch.js";

const REGEX = RegExp(
  // https://github.com/ytdl-org/youtube-dl/blob/a8035827177d6b59aca03bd717acb6a9bdd75ada/youtube_dl/extractor/niconico.py#L162
  "https?://(?:www\\.|secure\\.|sp\\.)?nicovideo\\.jp/watch/(?<id>(?:[a-z]{2})?[0-9]+)"
);

/** The rainlink nicovideo plugin options */
export interface NicoOptions {
  /** The number of how many track u want to resolve */
  searchLimit: number;
}

export class RainlinkPlugin extends SourceRainlinkPlugin {
  /**
   * The options of the plugin.
   */
  public options: NicoOptions;
  private _search: ((query: string, options?: RainlinkSearchOptions) => Promise<RainlinkSearchResult>) | undefined;
  private rainlink: Rainlink | null;

  private readonly methods: Record<string, (id: string, requester: unknown) => Promise<Result>>;

  /**
   * Initialize the plugin.
   * @param nicoOptions Options for run plugin
   */
  constructor(nicoOptions: NicoOptions) {
    super();
    this.options = nicoOptions;
    this.methods = {
      track: this.getTrack.bind(this),
    };
    this.rainlink = null;
  }

  /**
   * Source identify of the plugin
   * @returns string
   */
  public sourceIdentify(): string {
    return "nv";
  }

  /**
   * Source name of the plugin
   * @returns string
   */
  public sourceName(): string {
    return "nicovideo";
  }

  /**
   * Type of the plugin
   * @returns RainlinkPluginType
   */
  public type(): RainlinkPluginType {
    return RainlinkPluginType.SourceResolver;
  }

  /**
   * load the plugin
   * @param rainlink The rainlink class
   */
  public load(rainlink: Rainlink) {
    this.rainlink = rainlink;
    this._search = rainlink.search.bind(rainlink);
    rainlink.search = this.search.bind(this);
  }

  /**
   * Unload the plugin
   * @param rainlink The rainlink class
   */
  public unload(rainlink: Rainlink) {
    this.rainlink = rainlink;
    rainlink.search = rainlink.search.bind(rainlink);
  }

  /** Name function for getting plugin name */
  public name(): string {
    return "rainlink-nico";
  }

  private async search(query: string, options?: RainlinkSearchOptions): Promise<RainlinkSearchResult> {
    const res = await this._search!(query, options);
    if (!this.directSearchChecker(query)) return res;
    if (res.tracks.length == 0) return this.searchDirect(query, options);
    else return res;
  }

  /**
   * Directly search from plugin
   * @param query URI or track name query
   * @param options search option like RainlinkSearchOptions
   * @returns RainlinkSearchResult
   */
  public async searchDirect(query: string, options?: RainlinkSearchOptions | undefined): Promise<RainlinkSearchResult> {
    if (!this.rainlink || !this._search) throw new Error("rainlink-nico is not loaded yet.");

    if (!query) throw new Error("Query is required");
    const [, id] = REGEX.exec(query) || [];

    const isUrl = /^https?:\/\//.test(query);

    if (id) {
      this.debug(`Start search from ${this.sourceName()} plugin`);
      const _function = this.methods.track;
      const result: Result = await _function(id, options?.requester);

      const loadType = result ? RainlinkSearchResultType.TRACK : RainlinkSearchResultType.SEARCH;
      const playlistName = result.name ?? undefined;

      const tracks = result.tracks.filter(this.filterNullOrUndefined);
      return this.buildSearch(playlistName, tracks && tracks.length !== 0 ? tracks : [], loadType);
    } else if (options?.engine === this.sourceName() && !isUrl) {
      const result = await this.searchTrack(query, options?.requester);

      return this.buildSearch(undefined, result.tracks, RainlinkSearchResultType.SEARCH);
    } else return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
  }

  private buildSearch(
    playlistName?: string,
    tracks: RainlinkTrack[] = [],
    type?: RainlinkSearchResultType
  ): RainlinkSearchResult {
    return {
      playlistName,
      tracks,
      type: type ?? RainlinkSearchResultType.TRACK,
    };
  }

  private async searchTrack(query: string, requester: unknown) {
    try {
      const { data } = await search({
        q: query,
        targets: ["tagsExact"],
        fields: ["contentId"],
        sort: "-viewCounter",
        limit: 10,
      });

      const res: VideoInfo[] = [];

      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const nico = new NicoResolver(`https://www.nicovideo.jp/watch/${element.contentId}`);
        const info = await nico.getVideoInfo();
        res.push(info);
      }

      return {
        tracks: res.map((track) => this.buildrainlinkTrack(track, requester)),
      };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getTrack(id: string, requester: unknown) {
    try {
      const niconico = new NicoResolver(`https://www.nicovideo.jp/watch/${id}`);
      const info = await niconico.getVideoInfo();

      return { tracks: [this.buildrainlinkTrack(info, requester)] };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private filterNullOrUndefined(obj: unknown): obj is unknown {
    return obj !== undefined && obj !== null;
  }

  private buildrainlinkTrack(nicoTrack: any, requester: unknown) {
    return new RainlinkTrack(
      {
        encoded: "",
        info: {
          sourceName: this.sourceName(),
          identifier: nicoTrack.id,
          isSeekable: true,
          author: nicoTrack.owner ? nicoTrack.owner.nickname : "Unknown",
          length: nicoTrack.duration * 1000,
          isStream: false,
          position: 0,
          title: nicoTrack.title,
          uri: `https://www.nicovideo.jp/watch/${nicoTrack.id}`,
          artworkUrl: nicoTrack.thumbnail ? nicoTrack.thumbnail.url : "",
        },
        pluginInfo: {
          name: "rainlink.mod@nico",
        },
      },
      requester
    );
  }

  private debug(logs: string) {
    this.rainlink ? this.rainlink.emit(RainlinkEvents.Debug, `[Rainlink Nico Plugin]: ${logs}`) : true;
  }
}

// Interfaces
/** @ignore */
export interface Result {
  tracks: RainlinkTrack[];
  name?: string;
}
/** @ignore */
export interface OwnerInfo {
  id: number;
  nickname: string;
  iconUrl: string;
  channel: string | null;
  live: {
    id: string;
    title: string;
    url: string;
    begunAt: string;
    isVideoLive: boolean;
    videoLiveOnAirStartTime: string | null;
    thumbnailUrl: string | null;
  } | null;
  isVideoPublic: boolean;
  isMylistsPublic: boolean;
  videoLiveNotice: null;
  viewer: number | null;
}
/** @ignore */
interface OriginalVideoInfo {
  id: string;
  title: string;
  description: string;
  count: {
    view: number;
    comment: number;
    mylist: number;
    like: number;
  };
  duration: number;
  thumbnail: {
    url: string;
    middleUrl: string;
    largeUrl: string;
    player: string;
    ogp: string;
  };
  rating: {
    isAdult: boolean;
  };
  registerdAt: string;
  isPrivate: boolean;
  isDeleted: boolean;
  isNoBanner: boolean;
  isAuthenticationRequired: boolean;
  isEmbedPlayerAllowed: boolean;
  viewer: null;
  watchableUserTypeForPayment: string;
  commentableUserTypeForPayment: string;
  [key: string]: any;
}
/** @ignore */
export interface VideoInfo extends OriginalVideoInfo {
  owner: OwnerInfo;
}
