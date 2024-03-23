import { RainlinkConnectState } from "../Interface/Constants.js";
import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { RainlinkNode } from "../Node/RainlinkNode.js";
import { Rainlink } from "../Rainlink.js";

export class RainlinkNodeManager extends Map<string, RainlinkNode> {
  /** The rainlink manager */
  manager: Rainlink;

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
  add(node: RainlinkNodeOptions) {
    const newNode = new RainlinkNode(this.manager, node);
    newNode.connect();
    this.set(node.name, newNode);
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
    const nodes: RainlinkNode[] = [...this.values()];

    const onlineNodes = nodes.filter((node) => node.state === RainlinkConnectState.Connected);
    if (!onlineNodes.length) throw new Error("No nodes are online");

    // .filter((x) => x.manager.node.name === node.node.name)

    const temp = await Promise.all(
      onlineNodes.map(async (node) => ({
        node,
        players: (await node.rest.getPlayers()).filter((x) => this.get(x.guildId)).map((x) => this.get(x.guildId)!)
          .length,
      }))
    );

    return temp.reduce((a, b) => (a.players < b.players ? a : b)).node;
  }

  /**
   * Remove a node.
   * @returns void
   */
  remove(name: string): void {
    const node = this.get(name);
    if (node) {
      node.disconnect();
      this.delete(name);
    }
    return;
  }
}
