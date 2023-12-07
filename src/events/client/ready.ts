import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.info(`Logged in ${client.user!.tag}`);

    const activities = [
      `with ${client.guilds.cache.size} servers! | /music radio`,
      `with ${client.guilds.cache.reduce(
        (a, b) => a + b.memberCount,
        0
      )} users! | /music play`,
      `with ${client.channels.cache.size} channels! | /filter nightcore`,
    ];

    setInterval(() => {
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
    }, 15000);
  }
}
