import { Manager } from "../../manager.js";
import { JSONDriver } from "quick.db/JSONDriver";
import { Database } from "../../@types/Config.js";
import { TableSetup } from "./TableSetup.js";

export async function JSONConnectDriver(client: Manager, db_config: Database) {
  const start = Date.now();
  const jsonDriver = new JSONDriver(
    db_config.JSON.path || "./cylane.database.json"
  );
  const end = Date.now();
  client.logger.info(
    `Connected to the database! [LOCAL DATABASE/JSON] [${end - start}ms]`
  );
  await TableSetup(client, jsonDriver);
}
