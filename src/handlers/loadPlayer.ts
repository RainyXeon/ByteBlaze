import { Manager } from "../manager.js";

export default async (client: Manager) => {
  const event = await import("./Player/loadEvent.js");
  const update = await import("./Player/loadUpdate.js");
  const content = await import("./Player/loadContent.js");
  const setup = await import("./Player/loadSetup.js");
  event.default(client);
  update.default(client);
  content.default(client);
  setup.default(client);
  client.logger.loader("Shoukaku Player Events Loaded!");
};
