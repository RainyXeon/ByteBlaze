import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.info(import.meta.url, `Reconnected ${client.user!.tag} (${client.user!.id})`);
  }
}
