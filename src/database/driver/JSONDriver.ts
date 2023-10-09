import { Manager } from "../../manager.js";
import { QuickDB, JSONDriver } from "quick.db";
import { Database } from "../../types/Config.js";

export async function JSONConnectDriver(client: Manager, db_config: Database) {
  const jsonDriver = new JSONDriver(
    db_config.JSON.path || "./cylane.database.json"
  );
  client.logger.info("Connected to the database! [LOCAL DATABASE/JSON]");
  client.db = new QuickDB({ driver: jsonDriver });
}
