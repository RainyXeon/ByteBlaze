import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { MySQLDriver } from "quick.db/MySQLDriver";
import { TableSetup } from "./TableSetup.js";

export async function SQLConnectDriver(client: Manager, db_config: Database) {
  const config = db_config.MYSQL;

  const start = Date.now();
  const mysqlDriver = new MySQLDriver({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  try {
    await mysqlDriver.connect().then(async () => {
      const end = Date.now();
      client.logger.info(
        `Connected to the database! [MYSQL] [${end - start}ms]`
      );
      await TableSetup(client, mysqlDriver);
    });
  } catch (error) {
    client.logger.log({ level: "error", message: String(error) });
  }
}
