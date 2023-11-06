import { KazagumoPlayer } from "better-kazagumo";
import { Manager } from "../../manager.js";

export default async (
  client: Manager,
  name: string,
  players: KazagumoPlayer[],
  moved: boolean
) => {
  if (moved) return;
  if (client.used_lavalink.length != 0 && client.used_lavalink[0].name == name)
    return;
  if (players) players.map((player: KazagumoPlayer) => player.destroy());
  client.logger.debug(`Lavalink ${name}: Disconnected`);
  if (client.config.features.AUTOFIX_LAVALINK.enable && !client.fixing_nodes) {
    client.fixing_nodes = true;
    (await import("../../lavaScrap/autofixLavalink.js")).default(client);
  }
};
