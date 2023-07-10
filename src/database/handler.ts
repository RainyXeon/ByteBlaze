import { Manager } from '../manager.js';

export function handler(client: Manager) {
  const loadFile = [
    "loadEvents.js",
    "loadNodeEvents.js",
    "loadCheck.js",
    "loadPlayer.js",
  ]
  loadFile.forEach(async x => {
    const load = await import(`../handlers/${x}`)
    load.default(client)
  });
  return
}