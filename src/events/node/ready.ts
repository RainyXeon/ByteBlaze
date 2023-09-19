import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
export default async (client: Manager, name: string) => {
  if (client.used_lavalink.length != 0 && client.used_lavalink[0].name == name)
    return;

  client.fixing_nodes = false;

  client.manager.shoukaku.nodes.forEach((data, index) => {
    const reqUrl = new URL(data["url"], data["url"]);
    client.lavalink_using.push({
      host: reqUrl.hostname,
      port: Number(reqUrl.port) | 0,
      pass: data["auth"],
      secure: reqUrl.protocol == "ws://" ? false : true,
      name: index,
    });
  });

  client.logger.info(`Lavalink [${name}] connected.`);
};
