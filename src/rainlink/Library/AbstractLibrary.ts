// Get from: https://github.com/shipgirlproject/Shoukaku/blob/396aa531096eda327ade0f473f9807576e9ae9df/src/connectors/Connector.ts
// Special thanks to shipgirlproject team!

import { RainlinkNodeOptions } from "../Interface/Manager.js";
import { Rainlink } from "../Rainlink.js";
export const AllowedPackets = ["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"];

export abstract class AbstractLibrary {
  protected readonly client: any;
  protected manager: Rainlink | null;
  constructor(client: any) {
    this.client = client;
    this.manager = null;
  }

  protected ready(nodes: RainlinkNodeOptions[]): void {
    this.manager!.id = this.getId();
    if (!this.precheckNode(nodes))
      throw new Error("Node name must not have the same name and just include a-z, A-Z, 0-9 and _");
    for (const node of nodes) this.manager?.nodes.add(node);
  }

  protected precheckNode(node: RainlinkNodeOptions[]) {
    const regex = /^[a-zA-Z0-9_.-]*$/;
    for (const data of node) {
      if (!regex.test(data.name)) return false;
      if (node.filter((e) => e.name === data.name).length > 1) return false;
    }
    return true;
  }

  public set(manager: Rainlink): AbstractLibrary {
    this.manager = manager;
    return this;
  }

  abstract getId(): string;

  abstract sendPacket(shardId: number, payload: any, important: boolean): void;

  abstract listen(nodes: RainlinkNodeOptions[]): void;

  protected raw(packet: any): void {
    if (!AllowedPackets.includes(packet.t)) return;
    const guildId = packet.d.guild_id;
    const connection = this.manager!.voiceManagers.get(guildId);
    if (!connection) return;
    if (packet.t === "VOICE_SERVER_UPDATE") return connection.setServerUpdate(packet.d);
    const userId = packet.d.user_id;
    if (userId !== this.manager!.id) return;
    connection.setStateUpdate(packet.d);
  }
}
