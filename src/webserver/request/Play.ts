import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "play";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);

    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      );

    if (player.playing) return;
    if (player.queue.size == 0) {
      player.destroy();
      return ws.send(
        JSON.stringify({ guild: player.guildId, op: "player_destroy" })
      );
    }

    if (!player.playing) player.play();
  };
}
