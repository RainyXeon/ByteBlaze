import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { RainlinkRequesterOptions } from "../Interface/Rest.js";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import { Rainlink } from "../Rainlink.js";
import { RainlinkNode } from "../main.js";
import { RainlinkWebsocket } from "../Node/RainlinkWebsocket.js";

export abstract class AbstractDriver {
  /**  The id for the driver*/
  abstract id: string;
  /** Ws url for dealing connection to lavalink/nodelink server */
  abstract wsUrl: string;
  /** Http url for dealing rest request to lavalink/nodelink server */
  abstract httpUrl: string;
  /** The lavalink server season id to resume */
  abstract sessionId: string | null;
  /** All function to extend support driver */
  abstract functions: Map<string, (player: RainlinkPlayer, ...args: any) => unknown>;
  /**
   * Setup data and credentials for connect to lavalink/nodelink server
   * @returns void
   */
  abstract initial(manager: Rainlink, options: RainlinkNodeOptions, node: RainlinkNode): void;
  /**
   * Connect to lavalink/nodelink server
   * @returns RainlinkWebsocket
   */
  abstract connect(): RainlinkWebsocket;
  /**
   * Fetch function for dealing rest request to lavalink/nodelink server
   * @returns Promise<D | undefined>
   */
  abstract requester<D = any>(options: RainlinkRequesterOptions): Promise<D | undefined>;
  /**
   * Close the lavalink/nodelink server
   * @returns void
   */
  abstract wsClose(): void;
  /**
   * Update a season to resume able or not
   * @returns void
   */
  abstract updateSession(sessionId: string, mode: boolean, timeout: number): Promise<void>;
}
