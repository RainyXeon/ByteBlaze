import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.info(`Logged in ${client.user!.tag}`);

    setInterval(() => {
      client.user!.setPresence({
        activities: [
          {
            name: `v${client.metadata.version}`,
            type: 2,
          },
        ],
        status: "online",
      });
    }, 15000);
  }
}
