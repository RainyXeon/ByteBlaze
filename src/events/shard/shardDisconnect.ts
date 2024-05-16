import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, error: Error, id: number) {
    client.logger.warn("ShardDisconnect", `Shard ${id} Shard Disconnected!`);
  }
}
