import { Manager } from "../manager.js";

export async function handler(client: Manager) {
  ["client.js", "lavalink.js"].forEach(async (data: string) => {
    const preloader = await import(`./setup/${data}`);
    preloader.default(client);
  });
}
