import { Manager } from "../manager.js";
import check_lavalink_server from "../lava_scrap/check_lavalink_server.js";

export default async (client: Manager) => {
  if (client.config.features.AUTOFIX_LAVALINK) {
    check_lavalink_server(client)
    setInterval(async () => {
      check_lavalink_server(client)
    }, 1800000);
  }
}