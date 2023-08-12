import { Manager } from "../manager.js";

export default async (client: Manager) => {
  const prefix = await import("./Commands/loadPrefixCommands.js");
  prefix.default(client);
};
