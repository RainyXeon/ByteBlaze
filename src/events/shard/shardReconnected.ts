import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, id: number) {
    client.logger.info("ShardReconnect", `Shard ${id} Reconnected!`);
  }
}
