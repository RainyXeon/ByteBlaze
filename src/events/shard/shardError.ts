import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, id: number) {
    client.logger.error("ShardError", `Shard ${id} Errored!`);
  }
}
