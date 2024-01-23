import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Manager } from "../../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (client: Manager) => {
  readdirSync(join(__dirname, "..", "..", "events", "websocket")).forEach(
    async (file) => {
      const event = (await import(`../../events/websocket/${file}`)).default;
      let eventName = file.split(".")[0];
      client.wss.on(eventName, event.bind(null, client));
    },
  );
  client.logger.info(`Websocket Event Loaded!`);
};
