import { Manager } from "../../manager.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    if (!client.websocket) return;
    const data = JSON.stringify({
      op: "playerResume",
      guild: player.guildId,
    });
    client.websocket.send(data);
  }
}
