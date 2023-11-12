import { Manager } from "../../manager.js";
import { JSONDriver } from "quick.db/JSONDriver";
import { Database } from "../../@types/Config.js";
import { TableSetup } from "./TableSetup.js";
import { keyChecker } from "../keyChecker.js";

export async function JSONConnectDriver(client: Manager, db_config: Database) {

  const sampleConfig = {
    path: "./cylane.database.json"
  }
  
  keyChecker(db_config.config, sampleConfig, "json")

  const jsonDriver = new JSONDriver(
    db_config.config.path
  );

  await TableSetup(client, jsonDriver, "JSON");
}
