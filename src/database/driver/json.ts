import { Manager } from "../../manager.js";
import { JSONDriver } from "dreamvast.quick.db/JSONDriver";
import { Database } from "../../@types/Config.js";
import { TableSetup } from "../setup/table.js";
import { keyChecker } from "../keyChecker.js";

export class JSONConnectDriver {
  client: Manager;
  dbConfig: Database;
  constructor(client: Manager, dbConfig: Database) {
    this.client = client;
    this.dbConfig = dbConfig;
    this.connect();
  }

  connect() {
    const sampleConfig = {
      path: "./cylane.database.json",
    };

    new keyChecker(this.client, this.dbConfig.config, sampleConfig, "json");

    const jsonDriver = new JSONDriver(this.dbConfig.config.path);

    new TableSetup(this.client, jsonDriver, "JSON");
  }
}
