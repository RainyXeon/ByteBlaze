import {
  KazagumoPlugin as Plugin,
  KazagumoSearchOptions,
  KazagumoSearchResult,
  KazagumoError,
  SearchResultTypes,
} from "../../Modules/Interfaces.js";
import { Kazagumo } from "../../Kazagumo.js";
import { KazagumoTrack } from "../../Managers/Supports/KazagumoTrack.js";
import NicoResolver from "./NicoResolver.js";
import search from "./NicoSearch.js";

const REGEX = RegExp(
  // https://github.com/ytdl-org/youtube-dl/blob/a8035827177d6b59aca03bd717acb6a9bdd75ada/youtube_dl/extractor/niconico.py#L162
  "https?://(?:www\\.|secure\\.|sp\\.)?nicovideo\\.jp/watch/(?<id>(?:[a-z]{2})?[0-9]+)"
);

export interface NicoOptions {
  searchLimit: number;
}

export class KazagumoPlugin extends Plugin {
  public options: NicoOptions;
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

  constructor(nicoOptions: NicoOptions) {
    super();
    this.options = nicoOptions;
    this.methods = {
      track: this.getTrack.bind(this),
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
      throw new KazagumoError(1, "kazagumo-nico is not loaded yet.");

    if (!query) throw new KazagumoError(3, "Query is required");
    const [, id] = REGEX.exec(query) || [];

    const isUrl = /^https?:\/\//.test(query);

    if (id) {
      const _function = this.methods.track;
      const result: Result = await _function(id, options?.requester);

      const loadType = result ? "TRACK" : "SEARCH";
      const playlistName = result.name ?? undefined;

      const tracks = result.tracks.filter(this.filterNullOrUndefined);
      return this.buildSearch(
        playlistName,
        tracks && tracks.length !== 0 ? tracks : [],
        loadType
      );
    } else if (options?.engine === "niconicotv" && !isUrl) {
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
        const nico = new NicoResolver(
          `https://www.nicovideo.jp/watch/${element.contentId}`
        );
        const info = await nico.getVideoInfo();
        res.push(info);
      }

      return {
        tracks: res.map((track) => this.buildKazagumoTrack(track, requester)),
      };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private async getTrack(id: string, requester: unknown) {
    try {
      const niconico = new NicoResolver(`https://www.nicovideo.jp/watch/${id}`);
      const info = await niconico.getVideoInfo();

      return { tracks: [this.buildKazagumoTrack(info, requester)] };
    } catch (e: any) {
      throw new Error(e);
    }
  }

  private filterNullOrUndefined(obj: unknown): obj is unknown {
    return obj !== undefined && obj !== null;
  }

  private buildKazagumoTrack(nicoTrack: any, requester: unknown) {
    return new KazagumoTrack(
      {
        encoded: "",
        info: {
          sourceName: "niconicotv",
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
          name: "kazagumo.mod@nico",
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

export interface VideoInfo extends OriginalVideoInfo {
  owner: OwnerInfo;
}
