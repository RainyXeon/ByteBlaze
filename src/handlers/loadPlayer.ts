import { Manager } from "../manager.js";

export default async (client: Manager) => {
  (await import("./Player/loadEvent.js")).default(client);
  client.logger.loader("Shoukaku Player Events Loaded!");
};
