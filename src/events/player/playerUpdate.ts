import { Manager } from "../../manager.js";
import { PlayerUpdate } from "shoukaku";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer, data: PlayerUpdate) {
    client.emit("syncPosition", player);
  }
}
