import { Manager } from "../manager.js";
import { ClientDataService } from "./setup/client.js";
import { AutoReconnectLavalinkService } from "./setup/lavalink.js";
import { PremiumScheduleSetup } from "./setup/premium.js";
import { SongRequesterCleanSetup } from "./setup/setup.js";

export class Handler {
  constructor(client: Manager) {
    new SongRequesterCleanSetup(client);
    new ClientDataService(client);
    new AutoReconnectLavalinkService(client);
    new PremiumScheduleSetup(client);
  }
}
