import { Manager } from "../manager.js";

export async function handler(client: Manager) {
  ["client.js", "lavalink.js"].forEach(async (data: string) => {
    (await import(`./setup/${data}`)).default(client);
  });
}
