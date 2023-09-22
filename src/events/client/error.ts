import { Manager } from '../../manager.js'

export default async (client: Manager, error: Error) => {
  client.logger.log({
    level: 'error',
    message: error,
  })
}
