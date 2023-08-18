import { Manager } from "../manager.js";

export default async (client: Manager) => {
  const prefix = await import("./Commands/loadPrefixCommands.js");
  const slash = await import("./Commands/loadCommands.js");
  prefix.default(client);
  slash.default(client);
};
