import { Manager } from "../manager";
import { QuickDB, JSONDriver } from "quick.db";

export async function JSONConnectDriver(client: Manager, db_config: any) {
  const jsonDriver = new JSONDriver(db_config.JSON.path || "./cylane.database.json");
  client.logger.info('Connected to the database! [LOCAL DATABASE/JSON]')
  client.db = new QuickDB({ driver: jsonDriver });
}