import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.info(`Logged in ${client.user!.tag}`);

    let guilds = client.guilds.cache.size;
    let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
    let channels = client.channels.cache.size;

    const activities = [
      `with ${guilds} servers! | /music radio`,
      `with ${members} users! | /music play`,
      `with ${channels} channels! | /filter nightcore`,
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
    }, 15000)
  }
}
