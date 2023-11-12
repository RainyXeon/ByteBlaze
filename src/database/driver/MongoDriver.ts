import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { MongoDriver } from "quick.db/MongoDriver";
import { TableSetup } from "./TableSetup.js";
import { keyChecker } from "../keyChecker.js";

export async function MongoConnectDriver(client: Manager, db_config: Database) {
  const sampleConfig = {
    uri: "mongodb://127.0.0.1:27017/dreamvast"
  }

  keyChecker(db_config.config, sampleConfig, "mongodb")

  const mongoDriver = new MongoDriver(db_config.config.uri);
  
  await TableSetup(client, mongoDriver, "MongoDB");
}
