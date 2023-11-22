import util from "node:util";
import { Manager } from "../../manager.js";

export default async (client: Manager, logs: string) => {
  if (client.config.bot.DEBUG_MODE)
    return client.logger.debug(`[SHOUKAKU] ${util.inspect(logs)}`);
};
