import cron from "node-cron";
import { Manager } from "../../manager.js";
import { TopggService } from "../../services/TopggService.js";

export default class {
  async execute(client: Manager) {
    client.logger.info("ClientReady", `Logged in ${client.user!.tag}`);

    cron.schedule("0 */1 * * * *", () => {
      client.user!.setPresence({
        activities: [
          {
            name: `v${client.metadata.version} | /play`,
            type: 2,
          },
        ],
        status: "online",
      });
    });

    if (client.config.features.TOPGG_TOKEN && client.config.features.TOPGG_TOKEN.length !== 0) {
      const topgg = new TopggService(client);
      const res = await topgg.settingUp(String(client.user?.id));
      if (res) {
        client.topgg = topgg;
        client.topgg.startInterval();
      }
    }
  }
}
