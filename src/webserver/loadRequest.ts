import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadRequest(client: Manager) {
  let eventsPath = resolve(join(__dirname, "request"));
  let eventsFile = await readdirRecursive(eventsPath);

  await chillout.forEach(eventsFile, async (path) => {
    const events = await import(pathToFileURL(path).toString());
    client.ws_message!.set(events.default.name, events.default);
  });

  if (client.ws_message?.size) {
    client.logger.websocket(
      `${client.ws_message?.size} Websocket Request Loaded!`
    );
  } else {
    client.logger.websocket(
      `No websocket request file loaded, is websocket ok?`
    );
  }
}
