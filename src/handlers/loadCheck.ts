import { Manager } from "../manager.js";
import { checkLavalinkServer } from "./../lavaScrap/checkLavalinkServer.js";
import cron from "node-cron";

export class loadCheck {
  constructor(client: Manager) {
    if (client.config.features.AUTOFIX_LAVALINK.enable) {
      new checkLavalinkServer(client);

      cron.schedule("0 */30 * * * *", async () => {
        new checkLavalinkServer(client);
      });
    }
  }
}
