import { Manager } from '../../manager.js'
import { RainlinkPlayer } from 'rainlink'

export default class {
  async execute(client: Manager, player: RainlinkPlayer, data: unknown) {
    client.emit('playerUpdate', player)
  }
}
