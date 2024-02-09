import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";
import { AutoFixLavalink } from "../../autofix/AutoFixLavalink.js";

export default class {
  execute(
    client: Manager,
    name: string,
    players: KazagumoPlayer[],
    moved: boolean
  ) {
    if (moved) return;
    if (players) players.map((player: KazagumoPlayer) => player.destroy());
    client.logger.debug(`Lavalink ${name}: Disconnected`);
    if (client.config.features.AUTOFIX_LAVALINK.enable) {
      new AutoFixLavalink(client);
    }
  }
}
