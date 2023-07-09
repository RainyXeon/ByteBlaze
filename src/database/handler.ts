import { Manager } from '../manager.js';

export function handler(client: Manager) {
  const loadFile = [
    "loadEvents",
  ]
  loadFile.forEach(async x => {
    const load = await import(`../handlers/${x}`)
    load.default(client)
  });
  return client.logger.info("Loaded database handlers!")
}