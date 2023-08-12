import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  client.logger.error(`Errored ${client.user!.tag} (${client.user!.id})`);
};
