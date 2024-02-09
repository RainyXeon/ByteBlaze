import { Manager } from "../manager.js";
import { loadCommands } from "./Commands/loadCommands.js";
import { loadPlayerButtons } from "./Commands/loadPlayerButtons.js";

export class loadCommand {
  constructor(client: Manager) {
    new loadPlayerButtons(client);
    new loadCommands(client);
  }
}
