import { Manager } from '../manager.js'

export default async (client: Manager) => {
  ;(await import('./Websocket/loadCommand.js')).default(client)
}
