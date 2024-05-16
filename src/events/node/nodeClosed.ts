import { AutoFixLavalink } from "../../autofix/AutoFixLavalink.js";
import { Manager } from "../../manager.js";
import { RainlinkNode } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, node: RainlinkNode) {
    client.logger.debug("NodeClosed", `Lavalink ${node.options.name}: Closed`);
    if (client.config.features.AUTOFIX_LAVALINK.enable) {
      new AutoFixLavalink(client, node.options.name);
    }
  }
}
