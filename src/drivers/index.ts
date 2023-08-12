import { MongoConnectDriver } from "./MongoDriver.js";
import { JSONConnectDriver } from "./JSONDriver.js";
import { SQLConnectDriver } from "./SQLDriver.js";

const JSONDriver = JSONConnectDriver;
const MongoDriver = MongoConnectDriver;
const SQLDriver = SQLConnectDriver;

export { MongoDriver, JSONDriver, SQLDriver };
