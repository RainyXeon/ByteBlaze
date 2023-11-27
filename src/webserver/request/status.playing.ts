import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "status.playing";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      );
    if (player.state == 5)
      return ws.send(
        JSON.stringify({ op: "player_destroy", guild: player.guildId })
      );
    else if (player.state == 1)
      return ws.send(
        JSON.stringify({ op: "player_create", guild: player.guildId })
      );
  };
}
