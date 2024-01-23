import { Manager } from "../../manager.js";
import { QuickDB, JSONDriver } from "quick.db";
import { db_credentials_type } from "../../types/db_connect.js";

export async function JSONConnectDriver(
  client: Manager,
  db_config: db_credentials_type,
) {
  const jsonDriver = new JSONDriver(
    db_config.JSON.path || "./cylane.database.json",
  );
  client.logger.info("Connected to the database! [LOCAL DATABASE/JSON]");
  client.db = new QuickDB({ driver: jsonDriver });
}
