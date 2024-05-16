import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.info("ClientDisconnect", `Disconnected ${client.user!.tag} (${client.user!.id})`);
  }
}
