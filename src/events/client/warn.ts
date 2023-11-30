import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.warn(`Warned ${client.user!.tag} (${client.user!.id})`);
  }
}
