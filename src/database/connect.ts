import { Manager } from "../manager.js";
import { JSONDriver, MongoDriver, SQLDriver } from "../drivers/index.js";
import { handler } from "./handler.js";

export async function connectDB(client: Manager) {
  try {
    const db_config = client.config.features.DATABASE;

    function load_file() {
      handler(client);
    }

    if (
      db_config.JSON.enable &&
      !db_config.MYSQL.enable &&
      !db_config.MONGO_DB.enable
    ) {
      await JSONDriver(client, db_config).then(async () => {
        await load_file();
      });
      return;
    }

    if (
      db_config.MONGO_DB.enable &&
      !db_config.JSON.enable &&
      !db_config.MYSQL.enable
    ) {
      await MongoDriver(client, db_config).then(async () => {
        await load_file();
      });
      return;
    }

    if (
      db_config.MYSQL.enable &&
      !db_config.JSON.enable &&
      !db_config.MONGO_DB.enable
    ) {
      await SQLDriver(client, db_config).then(async () => {
        await load_file();
      });
      return;
    } else {
      await JSONDriver(client, db_config).then(async () => {
        await load_file();
      });
      return;
    }
  } catch (error) {
    return client.logger.log({ level: "error", message: error });
  }
}
