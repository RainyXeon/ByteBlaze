import { Manager } from "../manager.js";
import { loadPrefixCommands } from "./Commands/loadPrefixCommands.js";
import { loadSlashCommands } from "./Commands/loadSlashCommands.js";

export class loadCommand {
  constructor(client: Manager) {
    // new loadSlashCommands(client);
    new loadPrefixCommands(client);
  }
}
