import util from "node:util";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, logs: string) {
    if (client.config.bot.DEBUG_MODE) return client.logger.debug("RainlinkDebug", `${util.inspect(logs)}`);
  }
}
