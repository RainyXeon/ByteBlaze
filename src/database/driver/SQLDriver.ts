import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { QuickDB, MySQLDriver } from "quick.db";
import { TableSetup } from "./TableSetup.js";

export async function SQLConnectDriver(client: Manager, db_config: Database) {
  const config = db_config.MYSQL;

  const mysqlDriver = new MySQLDriver({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  try {
    await mysqlDriver.connect().then(async () => {
      client.logger.info("Connected to the database! [MYSQL]");
      TableSetup(client, mysqlDriver);
    });
  } catch (error) {
    client.logger.log({ level: "error", message: String(error) });
  }
}
