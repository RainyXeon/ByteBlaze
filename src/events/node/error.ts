import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, name: string, error: Error) {
    client.logger.debug(`Lavalink "${name}" error ${error}`);
  }
}
