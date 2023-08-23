import { Manager } from "../../manager.js";

export default {
  name: "status.pause",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );
    return ws.send(
      JSON.stringify({
        op: player.paused ? "pause_track" : "resume_track",
        guild: player.guildId,
      }),
    );
  },
};
