import { Manager } from "../manager.js";
import { playerLoadContent } from "./Player/loadContent.js";
import { playerLoadEvent } from "./Player/loadEvent.js";
import { playerLoadSetup } from "./Player/loadSetup.js";
import { playerLoadUpdate } from "./Player/loadUpdate.js";

export class loadPlayer {
  constructor(client: Manager) {
    new playerLoadEvent(client);
    new playerLoadUpdate(client);
    new playerLoadContent(client);
    new playerLoadSetup(client);
    client.logger.loader("Shoukaku Player Events Loaded!");
  }
}
