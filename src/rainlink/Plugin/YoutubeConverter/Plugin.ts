import { RainlinkTrack } from "../../main.js";
import { RainlinkPluginType } from "../../main.js";
import { RainlinkSearchOptions, RainlinkSearchResult, RainlinkSearchResultType } from "../../main.js";
import { Rainlink } from "../../main.js";
import { RainlinkPlugin as Plugin } from "../../main.js";

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
  constructor(options: YoutubeConvertOptions) {
    super();
    this.options = options;
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
    this._search = manager.search.bind(null);
    manager.search = this.search.bind(null);
  }

  /** unload function for make the plugin stop working */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unload(manager: Rainlink): void {
    if (!this._search) return;
    manager.search = this._search.bind(null);
    this._search = undefined;
  }

  private async search(query: string, options?: RainlinkSearchOptions): Promise<RainlinkSearchResult> {
    if (!this._search) return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
    const preRes = await this._search(query, options);
    if (preRes.tracks.length == 0 || preRes.tracks[0].source !== "youtube") return preRes;
    if (preRes.type == RainlinkSearchResultType.PLAYLIST) {
      const searchedTracks: RainlinkTrack[] = [];
      for (const track of preRes.tracks) {
        const res = await this.searchEngine(track.title);
        if (res.tracks.length !== 0) searchedTracks.push(res.tracks[0]);
      }
      return this.buildSearch(preRes.playlistName ?? undefined, searchedTracks, preRes.type);
    }
    const res = await this.searchEngine(preRes.tracks[0].title);
    if (res.tracks.length !== 0) return res;
    return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
  }

  private async searchEngine(query: string): Promise<RainlinkSearchResult> {
    if (!this._search) return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
    for (const SearchParams of this.options.sources!) {
      const res = await this._search(`directSearch=${SearchParams}:${query}`);
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
