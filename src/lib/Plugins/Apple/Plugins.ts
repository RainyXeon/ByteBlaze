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

const REGEX =
  /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/;
const REGEX_SONG_ONLY =
  /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)(\?|\&)([^=]+)\=([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/;

type HeaderType = {
  Authorization: string;
  origin: string;
};

type AppleOptions = {
  countryCode?: string;
  imageWidth?: number;
  imageHeight?: number;
};

const credentials = {
  APPLE_TOKEN:
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNzAyNTAyMjM0LCJleHAiOjE3MDk3NTk4MzQsInJvb3RfaHR0cHNfb3JpZ2luIjpbImFwcGxlLmNvbSJdfQ.zzeMLmez71PLinP9GozYSQnF7NYyCiXHB9tKL3-cyu3LzyeRnYz0ejLj4CrNJs0dlNkFg9_mwKmMLueUAR-KRg",
};

export class KazagumoPlugin extends Plugin {
  public options: AppleOptions;
  private _search:
    | ((
        query: string,
        options?: KazagumoSearchOptions
      ) => Promise<KazagumoSearchResult>)
    | null;
  private kazagumo: Kazagumo | null;
  private credentials: HeaderType;
  private readonly methods: Record<
    string,
    (id: string, requester: unknown) => Promise<Result>
  >;
  private fetchURL: string;
  private baseURL: string;
  public countryCode: string;
  public imageWidth: number;
  public imageHeight: number;

  constructor(appleOptions: AppleOptions) {
    super();
    this.methods = {
      artist: this.getArtist.bind(this),
      album: this.getAlbum.bind(this),
      playlist: this.getPlaylist.bind(this),
      track: this.getTrack.bind(this),
    };
    this.options = appleOptions;
    this.kazagumo = null;
    this._search = null;
    this.countryCode = this.options?.countryCode
      ? this.options?.countryCode
      : "us";
    this.imageHeight = this.options?.imageHeight
      ? this.options?.imageHeight
      : 900;
    this.imageWidth = this.options?.imageWidth ? this.options?.imageWidth : 600;
    this.baseURL = "https://api.music.apple.com/v1/";
    this.fetchURL = `https://amp-api.music.apple.com/v1/catalog/${this.countryCode}`;
    this.credentials = {
      Authorization: `Bearer ${credentials.APPLE_TOKEN}`,
      origin: "https://music.apple.com",
    };
  }

  public load(kazagumo: Kazagumo) {
    this.kazagumo = kazagumo;
    this._search = kazagumo.search.bind(kazagumo);
    kazagumo.search = this.search.bind(this);
  }

  public async getData(params: string) {
    const req = await axios.get(`${this.fetchURL}${params}`, {
      headers: this.credentials,
    });
    return req.data.data;
  }

  public async getSearchData(params: string) {
    const req = await axios.get(`${this.fetchURL}${params}`, {
      headers: this.credentials,
    });
    return req.data;
  }

  private async search(
    query: string,
    options?: KazagumoSearchOptions
  ): Promise<KazagumoSearchResult> {
    let type: string;
    let id: string;
    let isTrack: boolean = false;

    if (!this.kazagumo || !this._search)
      throw new KazagumoError(1, "kazagumo-apple is not loaded yet.");

    if (!query) throw new KazagumoError(3, "Query is required");

    if (!REGEX_SONG_ONLY.exec(query) || REGEX_SONG_ONLY.exec(query) == null) {
      const extract = REGEX.exec(query) || [];
      id = extract![4];
      type = extract![1];
    } else {
      const extract = REGEX_SONG_ONLY.exec(query) || [];
      id = extract![8];
      type = extract![1];
      isTrack = true;
    }

    // const [, type, id] = REGEX.exec(query) || [];

    const isUrl = /^https?:\/\//.test(query);

    if (type in this.methods) {
      try {
        let _function = this.methods[type];
        if (isTrack) _function = this.methods.track;
        const result: Result = await _function(id, options?.requester);

        const loadType = isTrack ? "TRACK" : "PLAYLIST";
        const playlistName = result.name ?? undefined;

        const tracks = result.tracks.filter(this.filterNullOrUndefined);
        return this.buildSearch(playlistName, tracks, loadType);
      } catch (e) {
        return this.buildSearch(undefined, [], "SEARCH");
      }
    } else if (options?.engine === "apple" && !isUrl) {
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
      const res = await this.getSearchData(
        `/search?types=songs&term=${query
          .replace(/ /g, "+")
          .toLocaleLowerCase()}`
      ).catch((e) => {
        throw new Error(e);
      });
      return {
        tracks: res.results.songs.data.map((track: Track) =>
          this.buildKazagumoTrack(track, requester)
        ),
      };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getTrack(id: string, requester: unknown): Promise<Result> {
    try {
      const track = await this.getData(`/songs/${id}`).catch((e) => {
        throw new Error(e);
      });
      return { tracks: [this.buildKazagumoTrack(track[0], requester)] };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getArtist(id: string, requester: unknown): Promise<Result> {
    try {
      const track = await this.getData(`/artists/${id}/view/top-songs`).catch(
        (e) => {
          throw new Error(e);
        }
      );
      return { tracks: [this.buildKazagumoTrack(track[0], requester)] };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getAlbum(id: string, requester: unknown): Promise<Result> {
    try {
      const album = await this.getData(`/albums/${id}`).catch((e) => {
        throw new Error(e);
      });

      const tracks = album[0].relationships.tracks.data
        .filter(this.filterNullOrUndefined)
        .map((track: Track) => this.buildKazagumoTrack(track, requester));

      return { tracks, name: album[0].attributes.name };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getPlaylist(id: string, requester: unknown): Promise<Result> {
    try {
      const playlist = await this.getData(`/playlists/${id}`).catch((e) => {
        throw new Error(e);
      });

      const tracks = playlist[0].relationships.tracks.data
        .filter(this.filterNullOrUndefined)
        .map((track: any) => this.buildKazagumoTrack(track, requester));

      return { tracks, name: playlist[0].attributes.name };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private filterNullOrUndefined(obj: unknown): obj is unknown {
    return obj !== undefined && obj !== null;
  }

  private buildKazagumoTrack(appleTrack: Track, requester: unknown) {
    const artworkURL = String(appleTrack.attributes.artwork.url)
      .replace("{w}", String(this.imageWidth))
      .replace("{h}", String(this.imageHeight));
    return new KazagumoTrack(
      {
        encoded: "",
        info: {
          sourceName: "apple",
          identifier: appleTrack.id,
          isSeekable: true,
          author: appleTrack.attributes.artistName
            ? appleTrack.attributes.artistName
            : "Unknown",
          length: appleTrack.attributes.durationInMillis,
          isStream: false,
          position: 0,
          title: appleTrack.attributes.name,
          uri: appleTrack.attributes.url || "",
          artworkUrl: artworkURL ? artworkURL : "",
        },
        pluginInfo: {
          name: "kazagumo.mod@spotify",
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

export interface Track {
  id: string;
  type: string;
  href: string;
  attributes: TrackAttributes;
}

export interface TrackAttributes {
  albumName: string;
  hasTimeSyncedLyrics: boolean;
  genreNames: any[];
  trackNumber: number;
  releaseDate: string;
  durationInMillis: number;
  isVocalAttenuationAllowed: boolean;
  isMasteredForItunes: boolean;
  isrc: string;
  artwork: Record<string, any>;
  audioLocale: string;
  composerName: string;
  url: string;
  playParams: Record<string, any>;
  discNumber: number;
  hasCredits: boolean;
  hasLyrics: boolean;
  isAppleDigitalMaster: boolean;
  audioTraits: any[];
  name: string;
  previews: any[];
  artistName: string;
}
