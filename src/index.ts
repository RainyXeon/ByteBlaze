import { Manager } from "./manager.js";
const client = new Manager()
client.connect()

client.on("error", (err) => {
  client.logger.log({
    level: "error",
    message: err,
  });
});