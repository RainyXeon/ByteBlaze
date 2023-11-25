import { Manager } from "../manager.js";
import { ClientDataService } from "./setup/client.js";
import { AutoReconnectLavalinkService } from "./setup/lavalink.js";

export class Handler {
  constructor(client: Manager) {
    new ClientDataService(client);
    new AutoReconnectLavalinkService(client);
  }
}
