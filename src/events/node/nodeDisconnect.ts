import { Manager } from "../../manager.js";
import { RainlinkNode } from "../../rainlink/main.js";

export default class {
  execute(client: Manager, node: RainlinkNode, code: number, reason: Buffer) {
    client.rainlink.players.full.forEach(([, player]) => {
      if (player.node.options.name == node.options.name) player.destroy();
    });
    client.logger.debug(
      import.meta.url,
      `Lavalink ${node.options.name}: Disconnected, Code: ${code}, Reason: ${reason}`
    );
  }
}
