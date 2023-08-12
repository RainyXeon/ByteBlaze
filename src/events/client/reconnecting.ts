import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  client.logger.info(`Reconnected ${client.user!.tag} (${client.user!.id})`);
};
