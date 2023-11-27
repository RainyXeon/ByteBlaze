import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "seek";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);

    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      );

    await player.seek(json.position * 1000);

    ws.send(
      JSON.stringify({
        op: "sync_position",
        guild: player.guildId,
        position: player.shoukaku.position,
      })
    );
  };
}
