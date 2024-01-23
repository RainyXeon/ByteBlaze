import { Manager } from "../manager.js";
import { loadContextCommands } from "./Commands/loadContextCommands.js";
import { loadPrefixCommands } from "./Commands/loadPrefixCommands.js";
import { loadSlashCommands } from "./Commands/loadSlashCommands.js";

export class loadCommand {
  constructor(client: Manager) {
    new loadSlashCommands(client);
    new loadContextCommands(client);
    if (client.config.features.MESSAGE_CONTENT.commands.enable)
      new loadPrefixCommands(client);
  }
}
