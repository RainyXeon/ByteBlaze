import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.websocket) return;

    client.websocket.send(
      JSON.stringify({
        op: "skip_track",
        guild: player.guildId,
      })
    );
  }
}
