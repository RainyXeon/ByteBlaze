import { RainlinkRequesterOptions } from "../Interface/Rest.js";
import { RainlinkPlayer } from "../Player/RainlinkPlayer.js";
import { RainlinkPlugin as SaveSessionPlugin } from "../Plugin/SaveSession/Plugin.js";
import { WebSocket } from "ws";

export abstract class AbstractDriver {
  /** Ws url for dealing connection to lavalink/nodelink server */
  abstract wsUrl: string;
  /** Http url for dealing rest request to lavalink/nodelink server */
  abstract httpUrl: string;
  /** The lavalink server season plugin to save all resume id */
  abstract sessionPlugin?: SaveSessionPlugin | null;
  /** The lavalink server season id to resume */
  abstract sessionId: string | null;
  /** All function to extend support driver */
  abstract functions: Map<string, (player: RainlinkPlayer, ...args: any) => unknown>;
  /**
   * Connect to lavalink/nodelink server
   * @returns WebSocket
   */
  abstract connect(): WebSocket;
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
