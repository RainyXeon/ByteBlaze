import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, error: Error, id: number) {
    client.logger.warn(import.meta.url, `Shard ${id} Shard Disconnected!`);
  }
}
