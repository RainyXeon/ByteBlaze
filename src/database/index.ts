import { MongoConnectDriver } from "./driver/mongodb.js";
import { JSONConnectDriver } from "./driver/json.js";
import { MySQLConnectDriver } from "./driver/mysql.js";
import { Manager } from "../manager.js";
import { PostgresConnectDriver } from "./driver/postgres.js";

export class DatabaseService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async execute() {
    try {
      const databaseConfig = this.client.config.features.DATABASE;

      switch (databaseConfig.driver) {
        case "json":
          new JSONConnectDriver(this.client, databaseConfig);
          break;
        case "mongodb":
          new MongoConnectDriver(this.client, databaseConfig);
          break;
        case "mysql":
          new MySQLConnectDriver(this.client, databaseConfig);
          break;
        case "postgres":
          new PostgresConnectDriver(this.client, databaseConfig);
          break;
        default:
          new JSONConnectDriver(this.client, databaseConfig);
          break;
      }
    } catch (error) {
      return this.client.logger.error("DatabaseService", String(error));
    }
  }
}
