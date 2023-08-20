import { Manager } from "../../manager.js";

export default {
  name: "shuffle",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );

    player.queue.shuffle();

    ws.send(JSON.stringify({ guild: player.guildId, op: "shuffle_queue" }));
  },
};
