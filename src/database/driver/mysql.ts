import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { MySQLDriver } from "dreamvast.quick.db/MySQLDriver";
import { TableSetup } from "../setup/table.js";
import { keyChecker } from "../keyChecker.js";

export class MySQLConnectDriver {
  client: Manager;
  dbConfig: Database;
  constructor(client: Manager, dbConfig: Database) {
    this.client = client;
    this.dbConfig = dbConfig;
    this.connect();
  }

  connect() {
    const sampleConfig = {
      host: "localhost",
      user: "me",
      password: "secret",
      database: "my_db",
    };

    new keyChecker(this.client, this.dbConfig.config, sampleConfig, "mysql");

    const mysqlDriver = new MySQLDriver(this.dbConfig.config);

    new TableSetup(this.client, mysqlDriver, "MySQL");
  }
}
