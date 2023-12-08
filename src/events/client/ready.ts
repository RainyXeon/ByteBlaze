import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.info(`Logged in ${client.user!.tag}`);

    setInterval(() => {
      client.user!.setPresence({
        activities: [
          {
            name: `${
              [
      `with ${client.guilds.cache.size} servers! | /music radio`,
      `with ${client.guilds.cache.reduce(
        (a, b) => a + b.memberCount,
        0
      )} users! | /music play`,
      `with ${client.channels.cache.size} channels! | /filter nightcore`,
    ][Math.floor(Math.random() * activities.length)]
            }`,
            type: 2,
          },
        ],
        status: "online",
      });
    }, 15000);
  }
}
