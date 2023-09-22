import { Manager } from '../manager.js'

export default async (client: Manager) => {
  ;(await import('./Player/loadEvent.js')).default(client)
  ;(await import('./Player/loadUpdate.js')).default(client)
  ;(await import('./Player/loadContent.js')).default(client)
  ;(await import('./Player/loadSetup.js')).default(client)
  client.logger.loader('Shoukaku Player Events Loaded!')
}
