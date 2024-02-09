import {
  KazagumoPlugin as Plugin,
  KazagumoSearchOptions,
  KazagumoSearchResult,
  KazagumoError,
  SearchResultTypes,
} from "../../Modules/Interfaces.js";
import { Kazagumo } from "../../Kazagumo.js";
import { KazagumoTrack } from "../../Managers/Supports/KazagumoTrack.js";
import axios from "axios";

const API_URL = "https://api.deezer.com/";

const REGEX =
  /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/;
const SHORT_REGEX = /^https:\/\/deezer\.page\.link\/[a-zA-Z0-9]{12}$/;

export class KazagumoPlugin extends Plugin {
  private _search:
    | ((
        query: string,
        options?: KazagumoSearchOptions
      ) => Promise<KazagumoSearchResult>)
    | null;
  private kazagumo: Kazagumo | null;

  private readonly methods: Record<
    string,
    (id: string, requester: unknown) => Promise<Result>
  >;

  constructor() {
    super();
    this.methods = {
      track: this.getTrack.bind(this),
      album: this.getAlbum.bind(this),
      playlist: this.getPlaylist.bind(this),
    };
    this.kazagumo = null;
    this._search = null;
  }

  public load(kazagumo: Kazagumo) {
    this.kazagumo = kazagumo;
    this._search = kazagumo.search.bind(kazagumo);
    kazagumo.search = this.search.bind(this);
  }

  private async search(
    query: string,
    options?: KazagumoSearchOptions
  ): Promise<KazagumoSearchResult> {
    if (!this.kazagumo || !this._search)
      throw new KazagumoError(1, "kazagumo-deezer is not loaded yet.");

    if (!query) throw new KazagumoError(3, "Query is required");

    const isUrl = /^https?:\/\//.test(query);

    if (SHORT_REGEX.test(query)) {
      const res = await axios.head(query);
      query = String(res.headers.location);
    }

    const [, type, id] = REGEX.exec(query) || [];

    if (type in this.methods) {
      try {
        const _function = this.methods[type];
        const result: Result = await _function(id, options?.requester);

        const loadType = type === "track" ? "TRACK" : "PLAYLIST";
        const playlistName = result.name ?? undefined;

        const tracks = result.tracks.filter(this.filterNullOrUndefined);
        return this.buildSearch(playlistName, tracks, loadType);
      } catch (e) {
        return this.buildSearch(undefined, [], "SEARCH");
      }
    } else if (options?.engine === "deezer" && !isUrl) {
      const result = await this.searchTrack(query, options?.requester);

      return this.buildSearch(undefined, result.tracks, "SEARCH");
    }

    return this._search(query, options);
  }

  private buildSearch(
    playlistName?: string,
    tracks: KazagumoTrack[] = [],
    type?: SearchResultTypes
  ): KazagumoSearchResult {
    return {
      playlistName,
      tracks,
      type: type ?? "TRACK",
    };
  }

  private async searchTrack(
    query: string,
    requester: unknown
  ): Promise<Result> {
    try {
      const request = await axios.get(
        `${API_URL}/search/track?q=${decodeURIComponent(query)}`
      );

      const res = request.data as SearchResult;
      return {
        tracks: res.data.map((track) =>
          this.buildKazagumoTrack(track, requester)
        ),
      };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getTrack(id: string, requester: unknown): Promise<Result> {
    try {
      const request = await axios.get(`${API_URL}/track/${id}/`);
      const track = request.data as DeezerTrack;

      return { tracks: [this.buildKazagumoTrack(track, requester)] };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getAlbum(id: string, requester: unknown): Promise<Result> {
    try {
      const request = await axios.get(`${API_URL}/album/${id}`);
      const album = request.data as Album;

      const tracks = album.tracks.data
        .filter(this.filterNullOrUndefined)
        .map((track) => this.buildKazagumoTrack(track, requester));

      return { tracks, name: album.title };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getPlaylist(id: string, requester: unknown): Promise<Result> {
    try {
      const request = await axios.get(`${API_URL}/playlist/${id}`);
      const playlist = request.data as Playlist;

      const tracks = playlist.tracks.data
        .filter(this.filterNullOrUndefined)
        .map((track) => this.buildKazagumoTrack(track, requester));

      return { tracks, name: playlist.title };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private filterNullOrUndefined(obj: unknown): obj is unknown {
    return obj !== undefined && obj !== null;
  }

  private buildKazagumoTrack(dezzerTrack: any, requester: unknown) {
    return new KazagumoTrack(
      {
        encoded: "",
        info: {
          sourceName: "deezer",
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
          name: "kazagumo.mod@deezer",
        },
      },
      requester
    );
  }
}

// Interfaces
export interface Result {
  tracks: KazagumoTrack[];
  name?: string;
}
export interface Album {
  title: string;
  tracks: AlbumTracks;
}
export interface AlbumTracks {
  data: DeezerTrack[];
  next: string | null;
}
export interface Artist {
  name: string;
}
export interface Playlist {
  tracks: PlaylistTracks;
  title: string;
}
export interface PlaylistTracks {
  data: DeezerTrack[];
  next: string | null;
}
export interface DeezerTrack {
  data: KazagumoTrack[];
}
export interface SearchResult {
  exception?: {
    severity: string;
    message: string;
  };
  loadType: string;
  playlist?: {
    duration_ms: number;
    name: string;
  };
  data: KazagumoTrack[];
}
