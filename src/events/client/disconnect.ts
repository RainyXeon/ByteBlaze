import { Manager } from '../../manager.js'

export default async (client: Manager) => {
  client.logger.info(`Disconnected ${client.user!.tag} (${client.user!.id})`)
}
