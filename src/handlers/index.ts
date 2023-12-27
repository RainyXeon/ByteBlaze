import { Manager } from "../manager.js";
import { loadCheck } from "./loadCheck.js";
import { loadCommand } from "./loadCommand.js";
import { loadMainEvents } from "./loadEvents.js";
import { loadNodeEvents } from "./loadNodeEvents.js";
import { loadPlayer } from "./loadPlayer.js";
import { loadWebsocketEvents } from "./loadWebsocketEvents.js";

export class initHandler {
  constructor(client: Manager) {
    if (client.config.features.AUTOFIX_LAVALINK.enable) new loadCheck(client);
    new loadMainEvents(client);
    new loadNodeEvents(client);
    new loadPlayer(client);
    new loadCommand(client);
    if (client.config.features.WEB_SERVER.websocket.enable)
      new loadWebsocketEvents(client);
  }
}
