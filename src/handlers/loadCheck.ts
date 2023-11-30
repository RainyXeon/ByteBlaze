import { Manager } from "../manager.js";
import { checkLavalinkServer } from "./../lavaScrap/checkLavalinkServer.js";

export class loadCheck {
  constructor(client: Manager) {
    if (client.config.features.AUTOFIX_LAVALINK.enable) {
      new checkLavalinkServer(client);

      setInterval(async () => {
        new checkLavalinkServer(client);
      }, 1800000);
    }
  }
}
