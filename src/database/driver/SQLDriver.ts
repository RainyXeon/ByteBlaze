import { Manager } from "../../manager.js";
import { db_credentials_type } from "../../types/db_connect.js";
import { QuickDB, MySQLDriver } from "quick.db";

export async function SQLConnectDriver(
  client: Manager,
  db_config: db_credentials_type
) {
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
      client.db = new QuickDB({ driver: mysqlDriver });
    });
  } catch (error) {
    client.logger.log({ level: "error", message: error });
  }
}
