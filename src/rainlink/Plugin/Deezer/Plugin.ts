import { RainlinkSearchOptions, RainlinkSearchResult, RainlinkSearchResultType } from "../../Interface/Manager.js";
import { Rainlink } from "../../Rainlink.js";
import { RainlinkTrack } from "../../Player/RainlinkTrack.js";
import { SourceRainlinkPlugin } from "../SourceRainlinkPlugin.js";
import { RainlinkEvents, RainlinkPluginType } from "../../Interface/Constants.js";
import { fetch, request } from "undici";

const API_URL = "https://api.deezer.com/";
const REGEX = /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/;
const SHORT_REGEX = /^https:\/\/deezer\.page\.link\/[a-zA-Z0-9]{12}$/;

export class RainlinkPlugin extends SourceRainlinkPlugin {
  private manager: Rainlink | null;
  private _search?: (query: string, options?: RainlinkSearchOptions) => Promise<RainlinkSearchResult>;
  private readonly methods: Record<string, (id: string, requester: unknown) => Promise<Result>>;
  /**
   * Source identify of the plugin
   * @returns string
   */
  public sourceIdentify(): string {
    return "dz";
  }

  /**
   * Source name of the plugin
   * @returns string
   */
  public sourceName(): string {
    return "deezer";
  }

  /**
   * Type of the plugin
   * @returns RainlinkPluginType
   */
  public type(): RainlinkPluginType {
    return RainlinkPluginType.SourceResolver;
  }

  /**
   * Initialize the plugin.
   */
  constructor() {
    super();
    this.methods = {
      track: this.getTrack.bind(this),
      album: this.getAlbum.bind(this),
      playlist: this.getPlaylist.bind(this),
    };
    this.manager = null;
    this._search = undefined;
  }

  /**
   * load the plugin
   * @param rainlink The rainlink class
   */
  public load(manager: Rainlink): void {
    this.manager = manager;
    this._search = manager.search.bind(manager);
    manager.search = this.search.bind(this);
  }

  /**
   * Unload the plugin
   * @param rainlink The rainlink class
   */
  public unload(rainlink: Rainlink) {
    this.manager = rainlink;
    this.manager.search = rainlink.search.bind(rainlink);
  }

  /** Name function for getting plugin name */
  public name(): string {
    return "rainlink-deezer";
  }

  protected async search(query: string, options?: RainlinkSearchOptions): Promise<RainlinkSearchResult> {
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
    if (!this.manager || !this._search) throw new Error("rainlink-deezer is not loaded yet.");

    if (!query) throw new Error("Query is required");

    const isUrl = /^https?:\/\//.test(query);

    if (SHORT_REGEX.test(query)) {
      const url = new URL(query);
      const res = await fetch(url.origin + url.pathname, { method: "HEAD" });
      query = String(res.headers.get("location"));
    }

    const [, type, id] = REGEX.exec(query) || [];

    if (type in this.methods) {
      this.debug(`Start search from ${this.sourceName()} plugin`);
      try {
        const _function = this.methods[type];
        const result: Result = await _function(id, options?.requester);

        const loadType = type === "track" ? RainlinkSearchResultType.TRACK : RainlinkSearchResultType.PLAYLIST;
        const playlistName = result.name ?? undefined;

        const tracks = result.tracks.filter(this.filterNullOrUndefined);
        return this.buildSearch(playlistName, tracks, loadType);
      } catch (e) {
        return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
      }
    } else if (options?.engine === this.sourceName() && !isUrl) {
      const result = await this.searchTrack(query, options?.requester);

      return this.buildSearch(undefined, result.tracks, RainlinkSearchResultType.SEARCH);
    } else return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
  }

  private async searchTrack(query: string, requester: unknown): Promise<Result> {
    try {
      const req = await fetch(`${API_URL}/search/track?q=${decodeURIComponent(query)}`);
      const data = await req.json();

      const res = data as SearchResult;
      return {
        tracks: res.data.map((track) => this.buildRainlinkTrack(track, requester)),
      };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getTrack(id: string, requester: unknown): Promise<Result> {
    try {
      const request = await fetch(`${API_URL}/track/${id}/`);
      const data = await request.json();
      const track = data as DeezerTrack;

      return { tracks: [this.buildRainlinkTrack(track, requester)] };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getAlbum(id: string, requester: unknown): Promise<Result> {
    try {
      const request = await fetch(`${API_URL}/album/${id}/`);
      const data = await request.json();
      const album = data as Album;

      const tracks = album.tracks.data
        .filter(this.filterNullOrUndefined)
        .map((track) => this.buildRainlinkTrack(track, requester));

      return { tracks, name: album.title };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getPlaylist(id: string, requester: unknown): Promise<Result> {
    try {
      const request = await fetch(`${API_URL}/playlist/${id}`);
      const data = await request.json();
      const playlist = data as Playlist;

      const tracks = playlist.tracks.data
        .filter(this.filterNullOrUndefined)
        .map((track) => this.buildRainlinkTrack(track, requester));

      return { tracks, name: playlist.title };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private filterNullOrUndefined(obj: unknown): obj is unknown {
    return obj !== undefined && obj !== null;
  }

  private buildSearch(
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

  private buildRainlinkTrack(dezzerTrack: any, requester: unknown) {
    return new RainlinkTrack(
      {
        encoded: "",
        info: {
          sourceName: this.sourceName(),
          identifier: dezzerTrack.id,
          isSeekable: true,
          author: dezzerTrack.artist ? dezzerTrack.artist.name : "Unknown",
          length: dezzerTrack.duration * 1000,
          isStream: false,
          position: 0,
          title: dezzerTrack.title,
          uri: `https://www.deezer.com/track/${dezzerTrack.id}`,
          artworkUrl: dezzerTrack.album ? dezzerTrack.album.cover : "",
        },
        pluginInfo: {
          name: "rainlink@deezer",
        },
      },
      requester
    );
  }

  private debug(logs: string) {
    this.manager ? this.manager.emit(RainlinkEvents.Debug, `[Rainlink Deezer Plugin]: ${logs}`) : true;
  }
}

// Interfaces
/** @ignore */
interface Result {
  tracks: RainlinkTrack[];
  name?: string;
}
/** @ignore */
interface Album {
  title: string;
  tracks: AlbumTracks;
}
/** @ignore */
interface AlbumTracks {
  data: DeezerTrack[];
  next: string | null;
}
/** @ignore */
interface Playlist {
  tracks: PlaylistTracks;
  title: string;
}
/** @ignore */
interface PlaylistTracks {
  data: DeezerTrack[];
  next: string | null;
}
/** @ignore */
interface DeezerTrack {
  data: RainlinkTrack[];
}
/** @ignore */
interface SearchResult {
  exception?: {
    severity: string;
    message: string;
  };
  loadType: string;
  playlist?: {
    duration_ms: number;
    name: string;
  };
  data: RainlinkTrack[];
}
