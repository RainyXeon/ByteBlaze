import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { Rainlink } from "../Rainlink.js";
import { RainlinkConnectState, RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkRest } from "./RainlinkRest.js";
import { setTimeout } from "node:timers/promises";
import { RainlinkPlayerEvents } from "./RainlinkPlayerEvents.js";
import { LavalinkEventsEnum } from "../Interface/LavalinkEvents.js";
import { LavalinkNodeStatsResponse, NodeStats } from "../Interface/Node.js";
import { AbstractDriver } from "../Drivers/AbstractDriver.js";
// Drivers
import { Lavalink4 } from "../Drivers/Lavalink4.js";
import { RainlinkWebsocket } from "../Utilities/RainlinkWebsocket.js";

export class RainlinkNode {
  /** The rainlink manager */
  public manager: Rainlink;
  /** The rainlink node options */
  public options: RainlinkNodeOptions;
  /** The rainlink rest manager */
  public rest: RainlinkRest;
  /** The lavalink server online status */
  public online: boolean = false;
  protected retryCounter = 0;
  /** The lavalink server connect state */
  public state: RainlinkConnectState = RainlinkConnectState.Closed;
  /** The lavalink server all status */
  public stats: NodeStats;
  protected sudoDisconnect = false;
  protected wsEvent: RainlinkPlayerEvents;
  /** Driver for connect to current version of Nodelink/Lavalink */
  public driver: AbstractDriver;

  /**
   * The lavalink server handler class
   * @param manager The rainlink manager
   * @param options The lavalink server options
   */
  constructor(manager: Rainlink, options: RainlinkNodeOptions) {
    this.manager = manager;
    this.options = options;
    const getDriver = this.manager.drivers.filter((driver) => driver.id === options.driver);
    if (!getDriver || getDriver.length == 0) {
      this.debug("No driver was found, using lavalink v4 driver instead");
      this.driver = new Lavalink4();
    } else {
      this.debug(`Now using driver: ${getDriver[0].id}`);
      this.driver = getDriver[0];
    }
    this.driver.initial(manager, this);
    const customRest =
      this.manager.rainlinkOptions.options!.structures && this.manager.rainlinkOptions.options!.structures.rest;
    this.rest = customRest ? new customRest(manager, options, this) : new RainlinkRest(manager, options, this);
    this.wsEvent = new RainlinkPlayerEvents();
    this.stats = {
      players: 0,
      playingPlayers: 0,
      uptime: 0,
      memory: {
        free: 0,
        used: 0,
        allocated: 0,
        reservable: 0,
      },
      cpu: {
        cores: 0,
        systemLoad: 0,
        lavalinkLoad: 0,
      },
      frameStats: {
        sent: 0,
        nulled: 0,
        deficit: 0,
      },
    };
  }

  /** Connect this lavalink server */
  public connect(): RainlinkWebsocket {
    return this.driver.connect();
  }

  /** @ignore */
  public wsOpenEvent() {
    this.clean(true);
    this.state = RainlinkConnectState.Connected;
    this.debug(`Node connected! URL: ${this.driver.wsUrl}`);
    this.manager.emit(RainlinkEvents.NodeConnect, this);
  }

  /** @ignore */
  public wsMessageEvent(data: Record<string, any>) {
    switch (data.op) {
      case LavalinkEventsEnum.Ready: {
        const isResume = this.manager.rainlinkOptions.options!.resume;
        const timeout = this.manager.rainlinkOptions.options?.resumeTimeout;
        this.driver.sessionId = data.sessionId;
        const customRest =
          this.manager.rainlinkOptions.options!.structures && this.manager.rainlinkOptions.options!.structures.rest;
        this.rest = customRest
          ? new customRest(this.manager, this.options, this)
          : new RainlinkRest(this.manager, this.options, this);
        if (isResume && timeout) {
          this.driver.updateSession(data.sessionId, isResume, timeout);
        }
        break;
      }
      case LavalinkEventsEnum.Event: {
        this.wsEvent.initial(data, this.manager);
        break;
      }
      case LavalinkEventsEnum.PlayerUpdate: {
        this.wsEvent.initial(data, this.manager);
        break;
      }
      case LavalinkEventsEnum.Status: {
        this.stats = this.updateStatusData(data as LavalinkNodeStatsResponse);
        break;
      }
    }
  }

  /** @ignore */
  public wsErrorEvent(logs: Error) {
    this.debug(`Node errored! URL: ${this.driver.wsUrl}`);
    this.manager.emit(RainlinkEvents.NodeError, this, logs);
  }

  /** @ignore */
  public async wsCloseEvent(code: number, reason: Buffer) {
    this.online = false;
    this.state = RainlinkConnectState.Disconnected;
    this.debug(`Node disconnected! URL: ${this.driver.wsUrl}`);
    this.manager.emit(RainlinkEvents.NodeDisconnect, this, code, reason);
    if (!this.sudoDisconnect && this.retryCounter !== this.manager.rainlinkOptions.options!.retryCount) {
      await setTimeout(this.manager.rainlinkOptions.options!.retryTimeout);
      this.retryCounter = this.retryCounter + 1;
      this.reconnect(true);
      return;
    }
    this.nodeClosed();
    return;
  }

  protected nodeClosed() {
    this.manager.emit(RainlinkEvents.NodeClosed, this);
    this.debug(`Node closed! URL: ${this.driver.wsUrl}`);
    this.clean();
  }

  protected updateStatusData(data: LavalinkNodeStatsResponse): NodeStats {
    return {
      players: data.players ?? this.stats.players,
      playingPlayers: data.playingPlayers ?? this.stats.playingPlayers,
      uptime: data.uptime ?? this.stats.uptime,
      memory: data.memory ?? this.stats.memory,
      cpu: data.cpu ?? this.stats.cpu,
      frameStats: data.frameStats ?? this.stats.frameStats,
    };
  }

  /** Disconnect this lavalink server */
  public disconnect() {
    this.sudoDisconnect = true;
    this.driver.wsClose();
  }

  /** Reconnect back to this lavalink server */
  public reconnect(noClean: boolean) {
    if (!noClean) this.clean();
    this.driver.connect();
  }

  /** Clean all the lavalink server state and set to default value */
  public clean(online: boolean = false) {
    this.sudoDisconnect = false;
    this.retryCounter = 0;
    this.online = online;
    this.state = RainlinkConnectState.Closed;
  }

  protected debug(logs: string) {
    this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Node @ ${this.options.name}] | ${logs}`);
  }
}
