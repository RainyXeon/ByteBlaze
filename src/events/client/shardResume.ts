import { Manager } from "../../manager.js";

export default async (client: Manager, id: number) => {
  client.logger.info(`Shard ${id} Resumed!`);
}