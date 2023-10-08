import { Manager } from "../../manager.js";
import { Database } from "../../types/Config.js"
import { QuickDB, MongoDriver } from "quick.db";

export async function MongoConnectDriver(
  client: Manager,
  db_config: Database
) {
  const mongoDriver = new MongoDriver(db_config.MONGO_DB.uri);
  await mongoDriver.connect();
  client.logger.info("Connected to the database! [MONGO DB]");
  client.db = new QuickDB({ driver: mongoDriver, normalKeys: true });
}
