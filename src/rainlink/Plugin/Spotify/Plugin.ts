import { request } from "undici";
import { RainlinkPluginType } from "../../Interface/Constants.js";
import { RainlinkSearchOptions, RainlinkSearchResult, RainlinkSearchResultType } from "../../Interface/Manager.js";
import { RainlinkTrack } from "../../Player/RainlinkTrack.js";
import { Rainlink } from "../../Rainlink.js";
import { SourceRainlinkPlugin } from "../SourceRainlinkPlugin.js";
import { RequestManager } from "./RequestManager.js";

const REGEX = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album|artist)[\/:]([A-Za-z0-9]+)/;
const SHORT_REGEX = /(?:https:\/\/spotify\.link)\/([A-Za-z0-9]+)/;

/** The rainlink spotify plugin options */
export interface SpotifyOptions {
  /** The client ID of your Spotify application. */
  clientId: string;
  /** The client secret of your Spotify application. */
  clientSecret: string;
  /** The clients for multiple spotify applications. NOT RECOMMENDED */
  clients?: { clientId: string; clientSecret: string }[];
  /** 100 tracks per page */
  playlistPageLimit?: number;
  /** 50 tracks per page */
  albumPageLimit?: number;
  /** The track limit when searching track */
  searchLimit?: number;
  /** Enter the country you live in. ( Can only be of 2 letters. For eg: US, IN, EN) */
  searchMarket?: string;
}

export class RainlinkPlugin extends SourceRainlinkPlugin {
  /**
   * The options of the plugin.
   */
  public options: SpotifyOptions;

  private _search: ((query: string, options?: RainlinkSearchOptions) => Promise<RainlinkSearchResult>) | null;
  private rainlink: Rainlink | null;

  private readonly methods: Record<string, (id: string, requester: unknown) => Promise<Result>>;
  private requestManager: RequestManager;

  /**
   * Initialize the plugin.
   * @param spotifyOptions Options for run plugin
   */
  constructor(spotifyOptions: SpotifyOptions) {
    super();
    this.options = spotifyOptions;
    this.requestManager = new RequestManager(spotifyOptions);

    this.methods = {
      track: this.getTrack.bind(this),
      album: this.getAlbum.bind(this),
      artist: this.getArtist.bind(this),
      playlist: this.getPlaylist.bind(this),
    };
    this.rainlink = null;
    this._search = null;
  }

  /**
   * Source identify of the plugin
   * @returns string
   */
  public sourceIdentify(): string {
    return "sp";
  }

  /**
   * Source name of the plugin
   * @returns string
   */
  public sourceName(): string {
    return "spotify";
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
    return "rainlink-spotify";
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
    if (!this.rainlink || !this._search) throw new Error("rainlink-spotify is not loaded yet.");

    if (!query) throw new Error("Query is required");

    const isUrl = /^https?:\/\//.test(query);

    if (SHORT_REGEX.test(query)) {
      const res = await fetch(query, { method: "HEAD" });
      query = String(res.headers.get("location"));
    }

    const [, type, id] = REGEX.exec(query) || [];

    if (type in this.methods) {
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

  private async searchTrack(query: string, requester: unknown): Promise<Result> {
    const limit =
      this.options.searchLimit && this.options.searchLimit > 0 && this.options.searchLimit < 50
        ? this.options.searchLimit
        : 10;
    const tracks = await this.requestManager.makeRequest<SearchResult>(
      `/search?q=${decodeURIComponent(query)}&type=track&limit=${limit}&market=${this.options.searchMarket ?? "US"}`
    );
    return {
      tracks: tracks.tracks.items.map((track) => this.buildrainlinkTrack(track, requester)),
    };
  }

  private async getTrack(id: string, requester: unknown): Promise<Result> {
    const track = await this.requestManager.makeRequest<TrackResult>(`/tracks/${id}`);
    return { tracks: [this.buildrainlinkTrack(track, requester)] };
  }

  private async getAlbum(id: string, requester: unknown): Promise<Result> {
    const album = await this.requestManager.makeRequest<AlbumResult>(
      `/albums/${id}?market=${this.options.searchMarket ?? "US"}`
    );
    const tracks = album.tracks.items
      .filter(this.filterNullOrUndefined)
      .map((track) => this.buildrainlinkTrack(track, requester, album.images[0]?.url));

    if (album && tracks.length) {
      let next = album.tracks.next;
      let page = 1;

      while (next && (!this.options.playlistPageLimit ? true : page < this.options.playlistPageLimit ?? 1)) {
        const nextTracks = await this.requestManager.makeRequest<PlaylistTracks>(next ?? "", true);
        page++;
        if (nextTracks.items.length) {
          next = nextTracks.next;
          tracks.push(
            ...nextTracks.items
              .filter(this.filterNullOrUndefined)
              .filter((a) => a.track)
              .map((track) => this.buildrainlinkTrack(track.track!, requester, album.images[0]?.url))
          );
        }
      }
    }

    return { tracks, name: album.name };
  }

  private async getArtist(id: string, requester: unknown): Promise<Result> {
    const artist = await this.requestManager.makeRequest<Artist>(`/artists/${id}`);
    const fetchedTracks = await this.requestManager.makeRequest<ArtistResult>(
      `/artists/${id}/top-tracks?market=${this.options.searchMarket ?? "US"}`
    );

    const tracks = fetchedTracks.tracks
      .filter(this.filterNullOrUndefined)
      .map((track) => this.buildrainlinkTrack(track, requester, artist.images[0]?.url));

    return { tracks, name: artist.name };
  }

  private async getPlaylist(id: string, requester: unknown): Promise<Result> {
    const playlist = await this.requestManager.makeRequest<PlaylistResult>(
      `/playlists/${id}?market=${this.options.searchMarket ?? "US"}`
    );

    const tracks = playlist.tracks.items
      .filter(this.filterNullOrUndefined)
      .map((track) => this.buildrainlinkTrack(track.track, requester, playlist.images[0]?.url));

    if (playlist && tracks.length) {
      let next = playlist.tracks.next;
      let page = 1;
      while (next && (!this.options.playlistPageLimit ? true : page < this.options.playlistPageLimit ?? 1)) {
        const nextTracks = await this.requestManager.makeRequest<PlaylistTracks>(next ?? "", true);
        page++;
        if (nextTracks.items.length) {
          next = nextTracks.next;
          tracks.push(
            ...nextTracks.items
              .filter(this.filterNullOrUndefined)
              .filter((a) => a.track)
              .map((track) => this.buildrainlinkTrack(track.track!, requester, playlist.images[0]?.url))
          );
        }
      }
    }
    return { tracks, name: playlist.name };
  }

  private filterNullOrUndefined(obj: unknown): obj is unknown {
    return obj !== undefined && obj !== null;
  }

  private buildrainlinkTrack(spotifyTrack: Track, requester: unknown, thumbnail?: string) {
    return new RainlinkTrack(
      {
        encoded: "",
        info: {
          sourceName: "spotify",
          identifier: spotifyTrack.id,
          isSeekable: true,
          author: spotifyTrack.artists[0] ? spotifyTrack.artists[0].name : "Unknown",
          length: spotifyTrack.duration_ms,
          isStream: false,
          position: 0,
          title: spotifyTrack.name,
          uri: `https://open.spotify.com/track/${spotifyTrack.id}`,
          artworkUrl: thumbnail ? thumbnail : spotifyTrack.album?.images[0]?.url,
        },
        pluginInfo: {
          name: this.name(),
        },
      },
      requester
    );
  }
}

/** @ignore */
export interface SearchResult {
  tracks: Tracks;
}
/** @ignore */
export interface Result {
  tracks: RainlinkTrack[];
  name?: string;
}
/** @ignore */
export interface TrackResult {
  album: Album;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;

  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track: any;
  track_number: number;
  type: string;
  uri: string;
}
/** @ignore */
export interface AlbumResult {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  copyrights: Copyright[];
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  label: string;
  name: string;
  popularity: number;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  tracks: Tracks;
  type: string;
  uri: string;
}
/** @ignore */
export interface ArtistResult {
  tracks: Track[];
}
/** @ignore */
export interface PlaylistResult {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: Owner;
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: PlaylistTracks;
  type: string;
  uri: string;
}
/** @ignore */
export interface Owner {
  display_name: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
}
/** @ignore */
export interface Followers {
  href: string | null;
  total: number;
}
/** @ignore */
export interface Tracks {
  href: string;
  items: Track[];
  next: string | null;
}
/** @ignore */
export interface PlaylistTracks {
  href: string;
  items: SpecialTracks[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}
/** @ignore */
export interface SpecialTracks {
  added_at: string;
  is_local: boolean;
  primary_color: string | null;
  track: Track;
}
/** @ignore */
export interface Copyright {
  text: string;
  type: string;
}
/** @ignore */
export interface ExternalUrls {
  spotify: string;
}
/** @ignore */
export interface ExternalIds {
  isrc: string;
}
/** @ignore */
export interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  external_urls: { [key: string]: string };
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}
/** @ignore */
export interface Image {
  height: number;
  url: string;
  width: number;
}
/** @ignore */
export interface Artist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  genres: [];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}
/** @ignore */
export interface Track {
  album?: Album;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}
