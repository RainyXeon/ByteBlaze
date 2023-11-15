import { Manager } from "../manager.js";
import { loadPrefixCommands } from "./Commands/loadPrefixCommands.js";
import { loadSlashCommands } from "./Commands/loadSlashCommands.js";

export default async (client: Manager) => {
  loadSlashCommands(client);
  loadPrefixCommands(client);
};
