import { readdirSync } from 'fs';
import { Manager } from '../manager.js';

export default async (client: Manager) => {
    const loadcommand = async (dirs: string) =>{
        const events = readdirSync(`./src/events/${dirs}/`).filter(d => d.endsWith('.ts'));
        for (let file of events) {
            const evt = await import(`../events/${dirs}/${file}`);
            const eName = file.split('.')[0];
            client.on(eName, evt.default.bind(null, client));
        }
    };
    ["client"].forEach((x) => loadcommand(x));
    client.logger.info('Client Events Loaded!');
};