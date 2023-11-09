import { Manager } from "../../manager.js";
import { JSONDriver } from "quick.db/JSONDriver";
import { Database } from "../../@types/Config.js";
import { TableSetup } from "./TableSetup.js";

export async function JSONConnectDriver(client: Manager, db_config: Database) {
  const jsonDriver = new JSONDriver(
    db_config.JSON.path || "./cylane.database.json"
  );
  await TableSetup(client, jsonDriver, "JSON");
}
