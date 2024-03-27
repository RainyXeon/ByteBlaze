import JSONdb from "simple-json-db";
import { RainlinkPlugin as Plugin } from "../RainlinkPlugin.js";
import { Rainlink } from "../../Rainlink.js";
import { RainlinkPluginType } from "../../Interface/Constants.js";

export class RainlinkPlugin extends Plugin {
  protected database: JSONdb;
  protected manager?: Rainlink;
  /** Whenever the plugin is enabled or not */
  public enabled: boolean = false;

  constructor(protected path?: string) {
    super();
    this.database = new JSONdb(path ?? "./rainlinkSessionID.json");
  }

  /** Name function for getting plugin name */
  public name(): string {
    return "rainlink-saveSession";
  }

  /** Type function for diferent type of plugin */
  public type(): RainlinkPluginType {
    return RainlinkPluginType.Default;
  }

  /** Load function for make the plugin working */
  public load(manager: Rainlink): void {
    this.manager = manager;
    this.enabled = true;
  }

  /** unload function for make the plugin stop working */
  public unload(manager: Rainlink): void {
    this.manager = manager;
    this.enabled = false;
  }

  /**
   * Set the session id to json database
   * @returns { sessionId: string, nodeHost: string }
   */
  public setSession(nodeHost: string, sessionId: string): { sessionId: string; nodeHost: string } {
    this.database.set(nodeHost, sessionId);
    return {
      sessionId: sessionId,
      nodeHost: nodeHost,
    };
  }

  /**
   * Get the session id to json database
   * @returns { sessionId: string, nodeHost: string }
   */
  public getSession(nodeHost: string): { sessionId: string | null; nodeHost: string } {
    const data = this.database.get(nodeHost);
    return {
      sessionId: !data || data == null ? null : data,
      nodeHost: nodeHost,
    };
  }

  /**
   * Delete the session id to json database
   * @returns void
   */
  public deleteSession(nodeHost: string): void {
    this.database.delete(nodeHost);
  }
}
