import { Manager } from '../../manager.js'
import { RainlinkNode } from 'rainlink'

export default class {
  async execute(client: Manager, node: RainlinkNode, error: Error) {
    client.logger.debug('NodeError', `Lavalink "${node.options.name}" error ${error}`)
  }
}
