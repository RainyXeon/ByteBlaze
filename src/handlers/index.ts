import { Manager } from "../manager.js";
import { Checker } from "./loadCheck.js";
import { CommandAndButtonLoader } from "./loadCommand.js";
import { ClientEventsLoader } from "./loadEvents.js";
import { PlayerLoader } from "./loadPlayer.js";

export class initHandler {
  constructor(client: Manager) {
    if (client.config.features.AUTOFIX_LAVALINK.enable) new Checker(client);
    new ClientEventsLoader(client);
    new PlayerLoader(client);
    new CommandAndButtonLoader(client);
  }
}
