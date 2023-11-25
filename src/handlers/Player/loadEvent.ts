import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class playerLoadEvent {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader();
  }
  async loader() {
    let eventsPath = resolve(join(__dirname, "..", "..", "events", "player"));
    let eventsFile = await readdirRecursive(eventsPath);
    await this.register(eventsFile);
  }

  async register(eventsFile: string[]) {
    await chillout.forEach(eventsFile, async (path) => {
      const events = await import(pathToFileURL(path).toString());

      var splitPath = function (str: string) {
        return str.split("\\").pop()!.split("/").pop()!.split(".")[0];
      };

      const eName = splitPath(path);
      this.client.manager.on(
        eName as "playerUpdate",
        events.default.bind(null, this.client)
      );
    });
  }
}
