/**
 * All the code below is from kazagumo.mod
 * An edited version is retrieved from
 * https://github.com/Takiyo0/Kazagumo/tree/d118eaf22559bd3f2159e2e147a67876d3986669
 * Original developer: Takiyo0 (Github)
 * Mod developer: RainyXeon (Github)
 * Special thanks to Takiyo0 (Github)
 */

import { Track } from "shoukaku";
import { KazagumoTrack } from "../Managers/Supports/KazagumoTrack.js";

export class KazagumoUtils {
  static convertKazagumoTrackToTrack(track: KazagumoTrack | Track): Track {
    if ((track as Track).info) return track as Track;
    track = track as KazagumoTrack;
    return {
      encoded: track.track,
      info: {
        isSeekable: track.isSeekable,
        isStream: track.isStream,
        title: track.title,
        uri: track.uri,
        identifier: track.identifier,
        sourceName: track.sourceName,
        author: track.author ?? "",
        length: track.length ?? 0,
        position: track.position ?? 0,
      },
      pluginInfo: {},
    };
  }
}
// Credit: Deivu (developer of Shoukaku) https://github.com/shipgirlproject/Shoukaku/blob/e7d94081cabbda7327dc04e467a45fcda49c24f2/src/Utils.ts#L1C1-L2C1
export type Constructor<T> = new (...args: any[]) => T;
