// Code from:
// https://github.com/y-chan/niconico-dl.js

import { parse } from "node-html-parser";
import { NiconicoAPIData, VideoInfo } from "./@types/NicoResolver.js";
import { fetch } from "undici";

const niconicoRegexp = RegExp(
  // https://github.com/ytdl-org/youtube-dl/blob/a8035827177d6b59aca03bd717acb6a9bdd75ada/youtube_dl/extractor/niconico.py#L162
  "https?://(?:www\\.|secure\\.|sp\\.)?nicovideo\\.jp/watch/(?<id>(?:[a-z]{2})?[0-9]+)"
);

export function isValidURL(url: string): boolean {
  return niconicoRegexp.test(url);
}

class NiconicoDL {
  private videoURL: string;
  private data: NiconicoAPIData | undefined;

  constructor(url: string) {
    if (!isValidURL(url)) {
      throw Error("Invalid url");
    }
    this.videoURL = url;
  }

  async getVideoInfo(): Promise<VideoInfo> {
    const fetchSite = await fetch(this.videoURL);
    const rawStringText = await fetchSite.text();
    const videoSiteDom = parse(rawStringText);
    const matchResult = videoSiteDom
      .querySelectorAll("div")
      .filter((a) => a.rawAttributes.id === "js-initial-watch-data");
    if (matchResult.length === 0) {
      throw Error("Failed get video site html...");
    }
    const patterns = {
      "&lt;": "<",
      "&gt;": ">",
      "&amp;": "&",
      "&quot;": '"',
      "&#x27;": "'",
      "&#x60;": "`",
    };
    const fixedString = matchResult[0].rawAttributes["data-api-data"].replace(
      /&(lt|gt|amp|quot|#x27|#x60);/g,
      function (match: string): string {
        // @ts-expect-error: Should expect array
        return patterns[match];
      }
    );
    this.data = JSON.parse(fixedString) as NiconicoAPIData;
    return Object.assign(this.data.video, {
      owner: this.data.owner,
    }) as VideoInfo;
  }
}

export default NiconicoDL;
