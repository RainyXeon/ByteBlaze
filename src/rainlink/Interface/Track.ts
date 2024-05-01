import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";

export interface ResolveOptions {
  /** Whenever u want to overwrite the track or not */
  overwrite?: boolean;
  /** Rainlink player property */
  player?: RainlinkPlayer;
  /** The name of node */
  nodeName?: string;
}
