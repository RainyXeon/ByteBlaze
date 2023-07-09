import { readdirSync } from 'fs';
import { Manager } from '../manager.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));


export default async (client: Manager) => {
    const loadcommand = async (dirs: string) =>{
        const events = readdirSync(join(__dirname, "..", "events", dirs)).filter(d => {
            if (d.endsWith(".js")) {
                return d
            } else if (d.endsWith(".js")) {
                return d
            }
        });
        for (let file of events) {
            const evt = await import(`../events/${dirs}/${file}`);
            const eName = file.split('.')[0];
            client.on(eName, evt.default.bind(null, client));
        }
    };
    ["client"].forEach((x) => loadcommand(x));
    client.logger.info('Client Events Loaded!');
};