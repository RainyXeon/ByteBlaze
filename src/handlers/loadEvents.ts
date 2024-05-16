import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class ClientEventsLoader {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader();
  }
  async loader() {
    await chillout.forEach(["client", "guild", "shard", "websocket"], async (path) => {
      let eventsPath = resolve(join(__dirname, "..", "events", path));
      let eventsFile = await readdirRecursive(eventsPath);
      await this.registerPath(eventsFile);
    });
    this.client.logger.loader(ClientEventsLoader.name, `Client Events Loaded!`);
  }

  async registerPath(eventsPath: string[]) {
    await chillout.forEach(eventsPath, async (path) => {
      await this.registerEvents(path);
    });
  }

  async registerEvents(path: string) {
    const events = new (await import(pathToFileURL(path).toString())).default();

    var splitPath = function (str: string) {
      return str.split("\\").pop()!.split("/").pop()!.split(".")[0];
    };

    const eName = splitPath(path);

    this.client.on(eName!, events.execute.bind(null, this.client));
  }
}
