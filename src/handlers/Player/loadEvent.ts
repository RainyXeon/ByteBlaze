import { readdirSync } from 'fs';
import { Manager } from '../../manager.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (client: Manager) => {
    const events = readdirSync(join(__dirname, "..", "..", "events", "player")).filter(d => {
      if (d.endsWith(".ts")) {
          return d
      } else if (d.endsWith(".js")) {
          return d
      }
    });
    for (let file of events) {
        const evt = await import(`../../events/player/${file}`)
        const eName = file.split('.')[0]
        client.manager.on(eName as "playerUpdate", evt.default.bind(null, client));
    }
}