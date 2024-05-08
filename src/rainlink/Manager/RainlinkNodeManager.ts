import { RainlinkConnectState, RainlinkEvents } from "../Interface/Constants.js";
import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { Rainlink } from "../Rainlink.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";

export class RainlinkNodeManager extends RainlinkDatabase<RainlinkNode> {
  /** The rainlink manager */
  public manager: Rainlink;

  /**
   * The main class for handling lavalink servers
   * @param manager
   */
  constructor(manager: Rainlink) {
    super();
    this.manager = manager;
  }

  /**
   * Add a new Node.
   * @returns RainlinkNode
   */
  public add(node: RainlinkNodeOptions) {
    const newNode = new RainlinkNode(this.manager, node);
    newNode.connect();
    this.set(node.name, newNode);
    this.debug(`Node ${node.name} added to manager!`);
    return newNode;
  }

  /**
   * Get a least used node.
   * @returns RainlinkNode
   */
  public async getLeastUsed(): Promise<RainlinkNode> {
    if (this.manager.rainlinkOptions.options!.nodeResolver) {
      const resolverData = await this.manager.rainlinkOptions.options!.nodeResolver(this);
      if (resolverData) return resolverData;
    }
    const nodes: RainlinkNode[] = this.values;

    const onlineNodes = nodes.filter((node) => node.state === RainlinkConnectState.Connected);
    if (!onlineNodes.length) throw new Error("No nodes are online");

    const temp = await Promise.all(
      onlineNodes.map(async (node) => {
        const stats = await node.rest.getStatus();
        return !stats ? { players: 0, node: node } : { players: stats.players, node: node };
      })
    );
    temp.sort((a, b) => a.players - b.players);

    return temp[0].node;
  }

  /**
   * Get all current nodes
   * @returns RainlinkNode[]
   */
  public all(): RainlinkNode[] {
    return this.values;
  }

  /**
   * Remove a node.
   * @returns void
   */
  public remove(name: string): void {
    const node = this.get(name);
    if (node) {
      node.disconnect();
      this.delete(name);
      this.debug(`Node ${name} removed from manager!`);
    }
    return;
  }

  protected debug(logs: string) {
    this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [NodeManager] | ${logs}`);
  }
}
