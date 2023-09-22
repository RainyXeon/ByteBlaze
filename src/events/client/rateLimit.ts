import { Manager } from '../../manager.js'

export default async (client: Manager) => {
  client.logger.error(`Rate Limited, Sleeping for ${0} seconds`)
}
