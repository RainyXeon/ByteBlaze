import { Manager } from '../manager.js'
import { ChannelHandler } from '../setup/ChannelHandler.js'
import { ChannelUpdater } from '../setup/ChannelUpdater.js'

export class PlayerLoader {
  constructor(client: Manager) {
    new ChannelHandler(client)
    new ChannelUpdater(client)
  }
}
