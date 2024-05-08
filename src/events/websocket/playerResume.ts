import { Manager } from "../../manager.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    client.wsl.get(player.guildId)?.send({
      op: "playerResume",
      guild: player.guildId,
    });
  }
}
