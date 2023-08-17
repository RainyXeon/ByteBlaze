import { MongoConnectDriver } from "./MongoDriver.js";
import { JSONConnectDriver } from "./JSONDriver.js";
import { SQLConnectDriver } from "./SQLDriver.js";
import { Manager } from "../manager.js";
import { loadDatabase } from "./init.js";

const JSONDriver = JSONConnectDriver;
const MongoDriver = MongoConnectDriver;
const SQLDriver = SQLConnectDriver;

export async function connectDB(client: Manager) {
  try {
    const db_config = client.config.features.DATABASE;

    function load_db() {
      client.is_db_connected = true;
      loadDatabase(client);
    }

    if (
      db_config.JSON.enable &&
      !db_config.MYSQL.enable &&
      !db_config.MONGO_DB.enable
    ) {
      await JSONDriver(client, db_config).then(async () => {
        await load_db();
      });
      return;
    }

    if (
      db_config.MONGO_DB.enable &&
      !db_config.JSON.enable &&
      !db_config.MYSQL.enable
    ) {
      await MongoDriver(client, db_config).then(async () => {
        await load_db();
      });
      return;
    }

    if (
      db_config.MYSQL.enable &&
      !db_config.JSON.enable &&
      !db_config.MONGO_DB.enable
    ) {
      await SQLDriver(client, db_config).then(async () => {
        await load_db();
      });
      return;
    } else {
      await JSONDriver(client, db_config).then(async () => {
        await load_db();
      });
      return;
    }
  } catch (error) {
    return client.logger.log({ level: "error", message: error });
  }
}
