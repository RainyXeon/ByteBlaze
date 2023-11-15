import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (client: Manager) => {
  let eventsPath = resolve(join(__dirname, "..", "events", "node"));
  let eventsFile = await readdirRecursive(eventsPath);

  await chillout.forEach(eventsFile, async (path) => {
    const events = await import(pathToFileURL(path).toString());

    var splitPath = function (str: string) {
      return str.split("\\").pop()!.split("/").pop();
    };

    const eName = splitPath(path);
    client.manager.shoukaku.on(
      eName as "raw",
      events.default.bind(null, client)
    );
  });

  client.logger.loader("Lavalink Server Events Loaded!");
};
