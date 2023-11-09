import { Manager } from "../../manager.js";
import { Database } from "../../@types/Config.js";
import { MongoDriver } from "quick.db/MongoDriver";
import { TableSetup } from "./TableSetup.js";

export async function MongoConnectDriver(client: Manager, db_config: Database) {
  const start = Date.now();
  const mongoDriver = new MongoDriver(db_config.MONGO_DB.uri);
  await mongoDriver.connect();

  const end = Date.now();
  client.logger.info(
    `Connected to the database! [MONGO DB] [${end - start}ms]`
  );
  await TableSetup(client, mongoDriver);
}
