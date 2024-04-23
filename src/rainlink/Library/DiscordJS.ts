// Modded from: https://github.com/shipgirlproject/Shoukaku/blob/396aa531096eda327ade0f473f9807576e9ae9df/src/connectors/libs/DiscordJS.ts
// Special thanks to shipgirlproject team!

import { AbstractLibrary } from "./AbstractLibrary.js";
import { RainlinkNodeOptions } from "../Interface/Manager.js";

export class DiscordJS extends AbstractLibrary {
  // sendPacket is where your library send packets to Discord Gateway
  public sendPacket(shardId: number, payload: any, important: boolean): void {
    return this.client.ws.shards.get(shardId)?.send(payload, important);
  }

  // getId is a getter where the lib stores the client user (the one logged in as a bot) id
  public getId(): string {
    return this.client.user.id;
  }

  // getShardCount is for dealing ws with lavalink server
  public getShardCount(): number {
    return this.client.shard && this.client.shard.count ? this.client.shard.count : 1;
  }

  // Listen attaches the event listener to the library you are using
  public listen(nodes: RainlinkNodeOptions[]): void {
    this.client.once("ready", () => this.ready(nodes));
    this.client.on("raw", (packet: any) => this.raw(packet));
  }
}
