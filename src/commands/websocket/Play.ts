import { Manager } from "../../manager.js";

export default {
  name: "play",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);

    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );

    if (player.playing) return;
    if (player.queue.size == 0) {
      player.destroy();
      return ws.send(
        JSON.stringify({ guild: player.guildId, op: "player_destroy" }),
      );
    }

    if (!player.playing) player.play();
  },
};
