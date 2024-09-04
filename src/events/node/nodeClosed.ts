import { AutoFixLavalink } from '../../autofix/AutoFixLavalink.js'
import { Manager } from '../../manager.js'
import { RainlinkNode } from 'rainlink'

export default class {
  async execute(client: Manager, node: RainlinkNode) {
    client.logger.debug('NodeClosed', `Lavalink ${node.options.name}: Closed`)
    if (client.config.utilities.AUTOFIX_LAVALINK.enable) {
      new AutoFixLavalink(client, node.options.name)
    }
  }
}
