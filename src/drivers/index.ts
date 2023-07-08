import { MongoConnectDriver } from "./MongoDriver"
import { JSONConnectDriver } from "./JSONDriver"
import { SQLConnectDriver } from "./SQLDriver"

const JSONDriver = JSONConnectDriver
const MongoDriver = MongoConnectDriver
const SQLDriver = SQLConnectDriver

export {
  MongoDriver,
  JSONDriver,
  SQLDriver
}