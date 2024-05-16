import { Manager } from "../../manager.js";
import { RainlinkNode } from "../../rainlink/main.js";

export default class {
  execute(client: Manager, node: RainlinkNode, code: number, reason: Buffer) {
    client.rainlink.players.forEach((player, index) => {
      if (player.node.options.name == node.options.name) player.destroy();
    });
    client.logger.debug(
      "NodeDisconnect",
      `Lavalink ${node.options.name}: Disconnected, Code: ${code}, Reason: ${reason}`
    );
  }
}
