import { Manager } from "../manager.js";
import check_lavalink_server from "../lavaScrap/checkLavalinkServer.js";

export default async (client: Manager) => {
  if (client.config.features.AUTOFIX_LAVALINK.enable) {
    check_lavalink_server(client);
    setInterval(async () => {
      check_lavalink_server(client);
    }, 1800000);
  }
};
