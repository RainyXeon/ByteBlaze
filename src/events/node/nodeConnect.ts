import { Manager } from "../../manager.js";
import { RainlinkNode } from "../../rainlink/main.js";

export default class {
  execute(client: Manager, node: RainlinkNode) {
    client.rainlink.nodes.forEach((data, index) => {
      client.lavalinkUsing.push({
        host: data.options.host,
        port: Number(data.options.port) | 0,
        pass: data.options.auth,
        secure: data.options.secure,
        name: index,
      });
    });

    client.logger.info("NodeConnect", `Lavalink [${node.options.name}] connected.`);
  }
}
