import { readdirSync } from 'fs'
import { Manager } from '../manager.js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default async (client: Manager) => {
  const events = readdirSync(join(__dirname, '..', 'events', 'node')).filter(
    (d) => {
      if (d.endsWith('.ts')) {
        return d
      } else if (d.endsWith('.js')) {
        return d
      }
    }
  )
  for (let file of events) {
    const evt = await import(`../events/node/${file}`)
    const eName = file.split('.')[0]
    client.manager.shoukaku.on(eName as 'raw', evt.default.bind(null, client))
  }

  client.logger.loader('Lavalink Server Events Loaded!')
}
