import { Manager } from '../manager.js'

export default async (client: Manager) => {
  ;(await import('./Commands/loadPrefixCommands.js')).default(client)
  ;(await import('./Commands/loadCommands.js')).default(client)
}
