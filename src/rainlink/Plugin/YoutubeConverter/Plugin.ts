import { RainlinkTrack } from "../../main.js";
import { RainlinkPluginType } from "../../main.js";
import { RainlinkSearchOptions, RainlinkSearchResult, RainlinkSearchResultType } from "../../main.js";
import { Rainlink } from "../../main.js";
import { RainlinkPlugin as Plugin } from "../../main.js";

const YOUTUBE_REGEX = [
  /^https?:\/\//,
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/,
  /^.*(youtu.be\/|list=)([^#\&\?]*).*/,
];

export type YoutubeConvertOptions = {
  /**
   * The order of the source you want to search replaces YouTube, for example: scsearch, spsearch.
   * The more sources added, the slower the performance will be.
   */
  sources?: string[];
};

export class RainlinkPlugin extends Plugin {
  private options: YoutubeConvertOptions;
  private _search?: (query: string, options?: RainlinkSearchOptions) => Promise<RainlinkSearchResult>;
  constructor(options?: YoutubeConvertOptions) {
    super();
    this.options = options ?? { sources: ["scsearch"] };
    if (!this.options.sources || this.options.sources.length == 0) this.options.sources = ["scsearch"];
  }
  /** Name function for getting plugin name */
  public name(): string {
    return "rainlink-youtubeConvert";
  }

  /** Type function for diferent type of plugin */
  public type(): RainlinkPluginType {
    return RainlinkPluginType.Default;
  }

  /** Load function for make the plugin working */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public load(manager: Rainlink): void {
    this._search = manager.search.bind(manager);
    manager.search = this.search.bind(this);
  }

  /** unload function for make the plugin stop working */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unload(manager: Rainlink): void {
    if (!this._search) return;
    manager.search = this._search.bind(manager);
    this._search = undefined;
  }

  private async search(query: string, options?: RainlinkSearchOptions): Promise<RainlinkSearchResult> {
    // Check if search func avaliable
    if (!this._search) return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);

    // Check if that's a yt link
    const match = YOUTUBE_REGEX.some((match) => {
      return match.test(query) == true;
    });
    if (!match) return await this._search(query, options);

    // Get search query
    const preRes = await this._search(query, options);
    if (preRes.tracks.length == 0) return preRes;

    // Remove track encoded to trick rainlink
    if (preRes.type == RainlinkSearchResultType.PLAYLIST) {
      for (const track of preRes.tracks) {
        track.encoded = "";
      }
      return preRes;
    }

    const song = preRes.tracks[0];
    const searchQuery = [song.author, song.title].filter((x) => !!x).join(" - ");
    const res = await this.searchEngine(searchQuery, options);
    if (res.tracks.length !== 0) return res;
    return preRes;
  }

  private async searchEngine(query: string, options?: RainlinkSearchOptions): Promise<RainlinkSearchResult> {
    if (!this._search) return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
    for (const SearchParams of this.options.sources!) {
      const res = await this._search(`directSearch=${SearchParams}:${query}`, options);
      if (res.tracks.length !== 0) return res;
    }
    return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
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
}
