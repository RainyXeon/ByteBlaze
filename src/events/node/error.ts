import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, name: string, error: Error) {
    client.logger.debug(import.meta.url, `Lavalink "${name}" error ${error}`);
  }
}
