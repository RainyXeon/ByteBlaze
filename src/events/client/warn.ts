import { Manager } from "../../manager.js";

export default async (client: Manager) => {
  client.logger.warn(`Warned ${client.user!.tag} (${client.user!.id})`);
};