import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { PostgresDriver } from "quick.db/PostgresDriver";
import { TableSetup } from "../setup/table.js";
import { keyChecker } from "../keyChecker.js";

export async function PostgresConnectDriver(
  client: Manager,
  db_config: Database
) {
  const sampleConfig = {
    host: "localhost",
    user: "me",
    password: "secret",
    database: "my_db",
  };

  keyChecker(db_config.config, sampleConfig, "postgres");

  const mysqlDriver = new PostgresDriver(db_config.config);

  await TableSetup(client, mysqlDriver, "Postgres");
}
