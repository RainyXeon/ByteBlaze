import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { MySQLDriver } from "quick.db/MySQLDriver";
import { TableSetup } from "../setup/table.js";
import { keyChecker } from "../keyChecker.js";

export async function MySQLConnectDriver(client: Manager, db_config: Database) {
  const sampleConfig = {
    host: "localhost",
    user: "me",
    password: "secret",
    database: "my_db",
  }

  keyChecker(db_config.config, sampleConfig, "mysql")

  const mysqlDriver = new MySQLDriver(db_config.config);
  
  await TableSetup(client, mysqlDriver, "MySQL");
}
