import { Manager } from "../../manager.js";
import { RainlinkNode } from "../../rainlink/main.js";

export default class {
  execute(client: Manager, node: RainlinkNode) {
    client.lavalinkUsing.push({
      host: node.options.host,
      port: Number(node.options.port) | 0,
      pass: node.options.auth,
      secure: node.options.secure,
      name: node.options.name,
    });

    client.logger.info("NodeConnect", `Lavalink [${node.options.name}] connected.`);
  }
}
