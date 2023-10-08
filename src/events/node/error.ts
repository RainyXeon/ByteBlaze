import { Manager } from "../../manager.js";

export default async (client: Manager, name: string, error: Error) => {
  if (client.used_lavalink.length != 0 && client.used_lavalink[0].name == name)
    return;
  client.logger.debug(`Lavalink "${name}" error ${error}`);
};
