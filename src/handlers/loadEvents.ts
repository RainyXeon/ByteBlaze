import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class ClientEventsLoader {
  client: Manager;
  counter: number = 0;
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
    this.client.logger.info(ClientEventsLoader.name, `${this.counter} Events Loaded!`);
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

    if (!events.execute)
      return this.client.logger.warn(
        ClientEventsLoader.name,
        `Event [${eName}] doesn't have exeture function on the class, Skipping...`
      );

    this.client.on(eName!, (...args: unknown[]) => events.execute(this.client, ...args));

    this.counter = this.counter + 1;
  }
}
