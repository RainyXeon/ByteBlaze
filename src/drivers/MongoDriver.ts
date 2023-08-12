import { Manager } from "../manager.js";
import { db_credentials_type } from "../types/db_connect.js";
import { QuickDB, MongoDriver } from "quick.db";

export async function MongoConnectDriver(
  client: Manager,
  db_config: db_credentials_type,
) {
  const mongoDriver = new MongoDriver(db_config.MONGO_DB.uri);

  try {
    await mongoDriver.connect().then(async () => {
      client.logger.info("Connected to the database! [MONGO DB]");
      client.db = new QuickDB({ driver: mongoDriver });
    });
  } catch (err) {
    client.logger.log({ level: "error", message: err });
  }
}
