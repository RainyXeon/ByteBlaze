import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.websocket) return;
    client.websocket.send(
      JSON.stringify({
        op: "sync_position",
        guild: player.guildId,
        position: player.shoukaku.position,
      })
    );
  }
}
