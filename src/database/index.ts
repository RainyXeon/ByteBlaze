import { MongoConnectDriver } from "./driver/MongoDriver.js";
import { JSONConnectDriver } from "./driver/JSONDriver.js";
import { SQLConnectDriver } from "./driver/SQLDriver.js";
import { Manager } from "../manager.js";
import { handler } from "./handler.js";

const JSONDriver = JSONConnectDriver;
const MongoDriver = MongoConnectDriver;
const SQLDriver = SQLConnectDriver;

export async function connectDB(client: Manager) {
  try {
    const db_config = client.config.features.DATABASE;

    function load_db() {
      client.is_db_connected = true;
      handler(client);
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
