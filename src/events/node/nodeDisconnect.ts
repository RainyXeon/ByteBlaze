import { Manager } from "../../manager.js";
import { AutoFixLavalink } from "../../autofix/AutoFixLavalink.js";
import { RainlinkNode } from "../../rainlink/main.js";

export default class {
  execute(client: Manager, node: RainlinkNode, code: number, reason: Buffer) {
    client.rainlink.players.forEach((player) => {
      if (player.node.options.name == node.options.name) player.destroy();
    });
    client.logger.debug(
      import.meta.url,
      `Lavalink ${node.options.name}: Disconnected, Code: ${code}, Reason: ${reason}`
    );
    if (client.config.features.AUTOFIX_LAVALINK.enable) {
      new AutoFixLavalink(client, node.options.name);
    }
  }
}
