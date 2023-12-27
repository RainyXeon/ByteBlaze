import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.warn("Cannot send ws message, something's went wrong....");
  }
}
