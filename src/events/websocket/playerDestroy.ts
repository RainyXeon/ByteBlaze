import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (client.websocket && client.config.features.WEB_SERVER.websocket.enable)
      client.websocket.send(
        JSON.stringify({ op: "player_destroy", guild: player.guildId })
      );
  }
}
