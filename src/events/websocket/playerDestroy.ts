import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.websocket) return client.emit("wsFallback");
    client.websocket.send(
      JSON.stringify({ op: "player_destroy", guild: player.guildId })
    );
  }
}
