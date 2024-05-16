import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, error: Error, id: number) {
    client.logger.warn("ShardManager", `Shard ${id} Shard Disconnected!`);
  }
}
