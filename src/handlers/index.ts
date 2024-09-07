import { Manager } from '../manager.js'
import { Checker } from './loadCheck.js'
import { CommandAndButtonLoader } from './loadCommand.js'
import { ClientEventsLoader } from './loadEvents.js'
import { PlayerEventLoader } from './loadPlayerEvents.js'
import { PlayerLoader } from './loadSetup.js'

export class initHandler {
  constructor(client: Manager) {
    if (client.config.utilities.AUTOFIX_LAVALINK.enable) new Checker(client)
    new PlayerEventLoader(client)
    new ClientEventsLoader(client)
    new PlayerLoader(client)
    new CommandAndButtonLoader(client)
  }
}
