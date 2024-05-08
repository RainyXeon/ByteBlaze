// Modded from: https://github.com/shipgirlproject/Shoukaku/blob/396aa531096eda327ade0f473f9807576e9ae9df/src/connectors/Connector.ts
// Special thanks to shipgirlproject team!

import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { Rainlink } from "../Rainlink.js";
import { LavalinkLoadType } from "../Interface/Constants.js";
import { RainlinkNode } from "./RainlinkNode.js";
import {
  LavalinkPlayer,
  LavalinkResponse,
  LavalinkStats,
  RainlinkRequesterOptions,
  RawTrack,
  RoutePlanner,
  UpdatePlayerInfo,
} from "../Interface/Rest.js";
import { NodeInfo } from "../Interface/Node.js";

export class RainlinkRest {
  /** The rainlink manager */
  public manager: Rainlink;
  protected options: RainlinkNodeOptions;
  /** The node manager (RainlinkNode class) */
  public nodeManager: RainlinkNode;
  protected sessionId: string | null;

  /**
   * The lavalink rest server handler class
   * @param manager The rainlink manager
   * @param options The rainlink node options, from RainlinkNodeOptions interface
   * @param nodeManager The rainlink's lavalink server handler class
   */
  constructor(manager: Rainlink, options: RainlinkNodeOptions, nodeManager: RainlinkNode) {
    this.manager = manager;
    this.options = options;
    this.nodeManager = nodeManager;
    this.sessionId = this.nodeManager.driver.sessionId ? this.nodeManager.driver.sessionId : "";
  }

  /**
   * Gets all the player with the specified sessionId
   * @returns Promise that resolves to an array of Lavalink players
   */
  public async getPlayers(): Promise<LavalinkPlayer[]> {
    const options: RainlinkRequesterOptions = {
      path: `/sessions/${this.sessionId}/players`,
      headers: { "content-type": "application/json" },
    };
    return (await this.nodeManager.driver.requester<LavalinkPlayer[]>(options)) ?? [];
  }

  /**
   * Gets current lavalink status
   * @returns Promise that resolves to an object of current lavalink status
   */
  public async getStatus(): Promise<LavalinkStats | undefined> {
    const options: RainlinkRequesterOptions = {
      path: "/stats",
      headers: { "content-type": "application/json" },
    };
    return await this.nodeManager.driver.requester<LavalinkStats>(options);
  }

  /**
   * Decode a single track from "encoded" properties
   * @returns Promise that resolves to an object of raw track
   */
  public async decodeTrack(base64track: string): Promise<RawTrack | undefined> {
    const options: RainlinkRequesterOptions = {
      path: `/decodetrack?encodedTrack=${encodeURIComponent(base64track)}`,
      headers: { "content-type": "application/json" },
    };
    return await this.nodeManager.driver.requester<RawTrack>(options);
  }

  /**
   * Updates a Lavalink player
   * @returns Promise that resolves to a Lavalink player
   */
  public updatePlayer(data: UpdatePlayerInfo): void {
    const options: RainlinkRequesterOptions = {
      path: `/sessions/${this.sessionId}/players/${data.guildId}`,
      params: { noReplace: data.noReplace?.toString() || "false" },
      headers: { "content-type": "application/json" },
      method: "PATCH",
      data: data.playerOptions as Record<string, unknown>,
      rawReqData: data,
    };
    this.nodeManager.driver.requester<LavalinkPlayer>(options);
  }

  /**
   * Destroy a Lavalink player
   * @returns Promise that resolves to a Lavalink player
   */
  public destroyPlayer(guildId: string): void {
    const options: RainlinkRequesterOptions = {
      path: `/sessions/${this.sessionId}/players/${guildId}`,
      headers: { "content-type": "application/json" },
      method: "DELETE",
    };
    this.nodeManager.driver.requester(options);
  }

  /**
   * A track resolver function to get track from lavalink
   * @returns LavalinkResponse
   */
  public async resolver(data: string): Promise<LavalinkResponse | undefined> {
    const options: RainlinkRequesterOptions = {
      path: "/loadtracks",
      params: { identifier: data },
      headers: { "content-type": "application/json" },
      method: "GET",
    };

    const resData = await this.nodeManager.driver.requester<LavalinkResponse>(options);

    if (!resData) {
      return {
        loadType: LavalinkLoadType.EMPTY,
        data: {},
      };
    } else return resData;
  }

  /**
   * Get routeplanner status from Lavalink
   * @returns Promise that resolves to a routeplanner response
   */
  public async getRoutePlannerStatus(): Promise<RoutePlanner | undefined> {
    const options = {
      path: "/routeplanner/status",
      headers: { "content-type": "application/json" },
    };
    return await this.nodeManager.driver.requester<RoutePlanner>(options);
  }

  /**
   * Release blacklisted IP address into pool of IPs
   * @param address IP address
   */
  public async unmarkFailedAddress(address: string): Promise<void> {
    const options = {
      path: "/routeplanner/free/address",
      method: "POST",
      headers: { "content-type": "application/json" },
      data: { address },
    };
    await this.nodeManager.driver.requester(options);
  }

  /**
   * Get Lavalink info
   */
  public getInfo(): Promise<NodeInfo | undefined> {
    const options = {
      path: "/info",
      headers: { "content-type": "application/json" },
    };
    return this.nodeManager.driver.requester(options);
  }

  protected testJSON(text: string) {
    if (typeof text !== "string") {
      return false;
    }
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }
}
