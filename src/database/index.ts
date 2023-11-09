import { MongoConnectDriver } from "./driver/MongoDriver.js";
import { JSONConnectDriver } from "./driver/JSONDriver.js";
import { MySQLConnectDriver } from "./driver/MySQLDriver.js";
import { Manager } from "../manager.js";

export async function connectDB(client: Manager) {
  try {
    const databaseConfig = client.config.features.DATABASE;

    const dbRegister: string[] = [];
    databaseConfig.JSON.enable ? dbRegister.push("JSON") : false;
    databaseConfig.MONGO_DB.enable ? dbRegister.push("MongoDB") : false;
    databaseConfig.MYSQL.enable ? dbRegister.push("MySQL") : false;

    if (dbRegister.length > 1) {
      await JSONConnectDriver(client, databaseConfig);
      return;
    }

    switch (dbRegister[0]) {
      case "JSON":
        await JSONConnectDriver(client, databaseConfig);
        break;
      case "MongoDB":
        await MongoConnectDriver(client, databaseConfig);
        break;
      case "MySQL":
        await MySQLConnectDriver(client, databaseConfig);
        break;
    }
  } catch (error) {
    return client.logger.log({ level: "error", message: String(error) });
  }
}
