import { Manager } from "../../manager.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadWsCommand(client: Manager) {
  const events = readdirSync(
    join(__dirname, "..", "..", "commands", "websocket")
  ).filter((d: string) => {
    if (d.endsWith(".ts")) {
      return d;
    } else if (d.endsWith(".js")) {
      return d;
    }
  });
  for (let file of events) {
    const evt = (await import(`../../commands/websocket/${file}`)).default;
    client.ws_message!.set(evt.name, evt);
  }
  if (client.ws_message?.size) {
    client.logger.info(`${client.ws_message?.size} Websocket Request Loaded!`);
  } else {
    client.logger.warn(`No websocket request file loaded, is websocket ok?`);
  }
}
