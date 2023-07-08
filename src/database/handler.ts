import { Manager } from '../manager';

export function handler(client: Manager) {
  return client.logger.info("Loaded database handlers!")
}