import { Manager } from "../../manager.js";
import { JSON_MESSAGE } from "../../@types/Websocket.js";

export default {
  name: "status.pause",
  run: async (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      );
    return ws.send(
      JSON.stringify({
        op: player.paused ? "pause_track" : "resume_track",
        guild: player.guildId,
      })
    );
  },
};
