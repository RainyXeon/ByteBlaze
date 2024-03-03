import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.info(`Logged in ${client.user!.tag}`);

    client.user!.setPresence({
      activities: [
        {
          name: `v${client.metadata.version} | /play`,
          type: 2,
        },
      ],
      status: "online",
    });
  }
}
