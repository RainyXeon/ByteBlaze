import { MongoConnectDriver } from "./driver/mongodb.js";
import { JSONConnectDriver } from "./driver/json.js";
import { MySQLConnectDriver } from "./driver/mysql.js";
import { Manager } from "../manager.js";
import { PostgresConnectDriver } from "./driver/postgres.js";

export async function connectDB(client: Manager) {
  try {
    const databaseConfig = client.config.features.DATABASE;

    switch (databaseConfig.driver) {
      case "json":
        await JSONConnectDriver(client, databaseConfig);
        break;
      case "mongodb":
        await MongoConnectDriver(client, databaseConfig);
        break;
      case "mysql":
        await MySQLConnectDriver(client, databaseConfig);
        break;
      case "postgres":
        await PostgresConnectDriver(client, databaseConfig);
        break;
      default:
        await JSONConnectDriver(client, databaseConfig);
        break;
    }
  } catch (error) {
    return client.logger.log({ level: "error", message: String(error) });
  }
}
