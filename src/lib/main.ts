/**
 * All the code below is from kazagumo.mod
 * An edited version is retrieved from
 * https://github.com/Takiyo0/Kazagumo/tree/d118eaf22559bd3f2159e2e147a67876d3986669
 * Original developer: Takiyo0 (Github)
 * Mod developer: RainyXeon (Github)
 * Special thanks to Takiyo0 (Github)
 */

import { KazagumoTrack } from "./Managers/Supports/KazagumoTrack.js";
import { KazagumoQueue } from "./Managers/Supports/KazagumoQueue.js";
import { KazagumoPlayer } from "./Managers/KazagumoPlayer.js";
import Plugins from "./Plugins/Index.js";
// import KazagumoPlayer from "./Managers/KazagumoPlayer";
// import { KazagumoOptions } from "./Modules/Interfaces";
// import { Connector } from "shoukaku/dist/src/connectors/Connector";
// import { NodeOption, PlayerUpdate, ShoukakuOptions, TrackExceptionEvent, WebSocketClosedEvent } from "shoukaku";

export * from "./Kazagumo.js";
export { KazagumoTrack, KazagumoQueue, KazagumoPlayer, Plugins };
export * from "./Modules/Interfaces.js";
