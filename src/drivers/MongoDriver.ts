import { Manager } from "../manager";
const { QuickDB, MongoDriver } = require("quick.db");

export async function MongoConnectDriver(client: Manager, db_config: any) {
  const mongoDriver = new MongoDriver(db_config.MONGO_DB.uri);

  try {
    await mongoDriver.connect().then(async () => {
      client.logger.info('Connected to the database! [MONGO DB]')
      client.db = new QuickDB({ driver: mongoDriver });
    })
  } catch (err) {
    client.logger.log({ level: 'error', message: err })
  }
}