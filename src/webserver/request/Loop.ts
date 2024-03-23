import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";
import { RequestInterface } from "../RequestInterface.js";
import WebSocket from "ws";
import { RainlinkLoopMode } from "../../rainlink/main.js";

export default class implements RequestInterface {
  name = "loop";
  run = async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    const player = client.rainlink.players.get(json.guild);

    if (!player) return ws.send(JSON.stringify({ error: "0x100", message: "No player on this guild" }));
    if (!json.status) {
      if (!json.mode) {
        return ws.send(
          JSON.stringify({
            error: "0x125",
            message: "Missing status as mode!",
            guild: player.guildId,
          })
        );
      }
      await player.setLoop(json.mode as RainlinkLoopMode);
      return;
    }

    if (json.status == "none") {
      await player.setLoop(RainlinkLoopMode.SONG);
      ws.send(
        JSON.stringify({
          guild: player.guildId,
          op: "loop_queue",
          status: "track",
        })
      );
    }

    if (json.status == "track") {
      await player.setLoop(RainlinkLoopMode.QUEUE);
      ws.send(
        JSON.stringify({
          guild: player.guildId,
          op: "loop_queue",
          status: "queue",
        })
      );
    }

    if (json.status == "queue") {
      await player.setLoop(RainlinkLoopMode.NONE);
      ws.send(
        JSON.stringify({
          guild: player.guildId,
          op: "loop_queue",
          status: "none",
        })
      );
    }
  };
}
