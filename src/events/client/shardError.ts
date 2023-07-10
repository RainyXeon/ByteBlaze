import { Manager } from "../../manager.js";

export default async (client: Manager, error: Error, id: number) => {
  client.logger.error(`Shard ${id} Errored!`);
}