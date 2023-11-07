import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { MongoDriver } from "quick.db";
import { TableSetup } from "./TableSetup.js";

export async function MongoConnectDriver(client: Manager, db_config: Database) {
  const mongoDriver = new MongoDriver(db_config.MONGO_DB.uri);
  await mongoDriver.connect();
  client.logger.info("Connected to the database! [MONGO DB]");
  TableSetup(client, mongoDriver);
}
