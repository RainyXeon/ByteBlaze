import { Manager } from "../manager.js";
import { loadCheck } from "./loadCheck.js";
import { loadCommand } from "./loadCommand.js";
import { loadMainEvents } from "./loadEvents.js";
import { loadPlayer } from "./loadPlayer.js";

export class initHandler {
  constructor(client: Manager) {
    if (client.config.features.AUTOFIX_LAVALINK.enable) new loadCheck(client);
    new loadMainEvents(client);
    new loadPlayer(client);
    new loadCommand(client);
  }
}
