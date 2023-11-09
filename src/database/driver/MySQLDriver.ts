import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { MySQLDriver } from "quick.db/MySQLDriver";
import { TableSetup } from "./TableSetup.js";

export async function MySQLConnectDriver(client: Manager, db_config: Database) {
  const config = db_config.MYSQL;
  const mysqlDriver = new MySQLDriver({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
  });
  await TableSetup(client, mysqlDriver, "MySQL");
}
