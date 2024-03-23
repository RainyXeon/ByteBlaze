import { Manager } from "../../manager.js";
import { RainlinkNode } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, node: RainlinkNode, error: Error) {
    client.logger.debug(import.meta.url, `Lavalink "${node.options.name}" error ${error}`);
  }
}
