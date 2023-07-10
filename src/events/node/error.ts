import { Manager } from "../../manager.js";

export default async (client: Manager, name: string, error: Error) => {
  if (client.used_lavalink.length != 0 && client.used_lavalink[0].name == name) return
  client.logger.debug(`Lavalink "${name}" error ${error}`);
  if (client.config.features.AUTOFIX_LAVALINK && !client.fixing_nodes) {
      client.fixing_nodes = true
      const autoFix = await import("../../lava_scrap/autofix_lavalink.js")
      autoFix.default(client)
  }
};