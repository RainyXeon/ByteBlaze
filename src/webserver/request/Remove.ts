import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";

export default class implements RequestInterface {
  name = "remove";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      );

    const index = player.queue.map((e) => e.uri).indexOf(json.uri);

    if (index == -1) return player.skip();
    else if (index != -1) {
      const removed = player.queue[index];
      player.queue.splice(index, 1);

      ws.send(
        JSON.stringify({
          op: "removed_track",
          guild: player.guildId,
          uri: removed.uri,
        })
      );
    }
  };
}
