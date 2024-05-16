import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager) {
    client.logger.error("ClientRateLimited", `Rate Limited, Sleeping for ${0} seconds`);
  }
}
