import { Manager } from "../manager.js";
import { playerLoadContent } from "./Player/loadContent.js";
import { playerLoadEvent } from "./Player/loadEvent.js";
import { playerLoadSetup } from "./Player/loadSetup.js";
import { playerLoadUpdate } from "./Player/loadUpdate.js";

export default async (client: Manager) => {
  playerLoadEvent(client);
  playerLoadUpdate(client);
  playerLoadContent(client);
  playerLoadSetup(client);
  client.logger.loader("Shoukaku Player Events Loaded!");
};
