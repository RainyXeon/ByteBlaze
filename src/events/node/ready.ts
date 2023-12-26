import { Manager } from "../../manager.js";

export default class {
  execute(client: Manager, name: string) {
    client.manager.shoukaku.nodes.forEach((data, index) => {
      const reqUrl = new URL(data["url"], data["url"]);
      client.lavalinkUsing.push({
        host: reqUrl.hostname,
        port: Number(reqUrl.port) | 0,
        pass: data["auth"],
        secure: reqUrl.protocol == "ws://" ? false : true,
        name: index,
      });
    });

    client.logger.info(`Lavalink [${name}] connected.`);
  }
}
