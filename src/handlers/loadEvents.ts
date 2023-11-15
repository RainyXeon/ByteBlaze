import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (client: Manager) => {
  async function loadEvents(eventsPath: string[]) {
    await chillout.forEach(eventsPath, async (path) => {
      const events = await import(pathToFileURL(path).toString());

      var splitPath = function (str: string) {
        return str.split("\\").pop()!.split("/").pop();
      };

      const eName = splitPath(path);
      client.on(eName!, events.default.bind(null, client));
    });
  }

  await chillout.forEach(["client", "guild"], async (path) => {
    let eventsPath = resolve(join(__dirname, "..", "events", path));
    let eventsFile = await readdirRecursive(eventsPath);
    loadEvents(eventsFile);
  });
  client.logger.loader(`Client Events Loaded!`);
};
