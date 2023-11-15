import { Manager } from "../manager.js";
import { loadWsCommand } from "./Websocket/loadCommand.js";

export default async (client: Manager) => {
  await loadWsCommand(client);
};
