import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";
import { PlayerUpdate } from "shoukaku";

export default class {
  async execute(client: Manager, player: KazagumoPlayer, data: PlayerUpdate) {
    if (client.websocket)
      client.websocket.send(
        JSON.stringify({
          op: "sync_position",
          guild: player.guildId,
          position: player.shoukaku.position,
        })
      );
  }
}
