import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.error(import.meta.url, `Rate Limited, Sleeping for ${0} seconds`);
  }
}
