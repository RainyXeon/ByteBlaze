import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    const guild = await client.guilds.cache.get(player.guildId);
    client.logger.info(
      `Player Created in @ ${guild!.name} / ${player.guildId}`
    );
    if (client.websocket)
      client.websocket.send(
        JSON.stringify({ op: "player_create", guild: player.guildId })
      );
  }
}
