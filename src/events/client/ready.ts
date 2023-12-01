import { Manager } from "../../manager.js";
import { DeployService } from "../../utils/autoDeploy.js";
import cron from "node-cron";

export default class {
  async execute(client: Manager) {
    client.logger.info(`Logged in ${client.user!.tag}`);
    // Auto deploy
    new DeployService(client);

    let guilds = client.guilds.cache.size;
    let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
    let channels = client.channels.cache.size;

    const activities = [
      `with ${guilds} servers! | /music radio`,
      `with ${members} users! | /music play`,
      `with ${channels} channels! | /filter nightcore`,
    ];

    cron.schedule("0 */1 * * * *", async () => {
      client.user!.setPresence({
        activities: [
          {
            name: `${
              activities[Math.floor(Math.random() * activities.length)]
            }`,
            type: 2,
          },
        ],
        status: "online",
      });
    });
  }
}
