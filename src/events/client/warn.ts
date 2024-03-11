import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.warn(import.meta.url, `Warned ${client.user!.tag} (${client.user!.id})`);
  }
}
