import { Manager } from "../manager.js";
import { CheckLavalinkServer } from "./../autofix/CheckLavalinkServer.js";
import cron from "node-cron";

export class Checker {
  constructor(client: Manager) {
    if (client.config.features.AUTOFIX_LAVALINK.enable) {
      new CheckLavalinkServer(client);

      cron.schedule("0 */30 * * * *", async () => {
        new CheckLavalinkServer(client, false);
      });
    }
  }
}
