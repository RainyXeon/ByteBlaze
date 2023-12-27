import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";
import { PlayerUpdate } from "shoukaku";

export default class {
  async execute(client: Manager, player: KazagumoPlayer, data: PlayerUpdate) {
    client.emit("syncPosition", player);
  }
}
