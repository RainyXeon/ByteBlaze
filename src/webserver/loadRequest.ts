import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class loadRequest {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader();
  }

  async loader() {
    let eventsPath = resolve(join(__dirname, "request"));
    let eventsFile = await readdirRecursive(eventsPath);

    await this.register(eventsFile);

    if (this.client.wsMessage?.size) {
      this.client.logger.websocket(
        `${this.client.wsMessage?.size} Websocket Request Loaded!`
      );
    } else {
      this.client.logger.websocket(
        `No websocket request file loaded, is websocket ok?`
      );
    }
  }

  async register(eventsFile: string[]) {
    await chillout.forEach(eventsFile, async (path) => {
      const events = new (
        await import(pathToFileURL(path).toString())
      ).default();
      this.client.wsMessage!.set(events.name, events);
    });
  }
}
