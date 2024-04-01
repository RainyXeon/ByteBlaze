import { Manager } from "../../manager.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    if (!client.websocket) return;
    client.websocket.send(JSON.stringify({ op: "playerDestroy", guild: player.guildId }));
  }
}
