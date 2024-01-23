import { Manager } from "../../manager.js";

export default {
  name: "loop",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);

    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );
    if (!json.status)
      return ws.send(
        JSON.stringify({
          error: "0x125",
          message: "Missing status!",
          guild: player.guildId,
        }),
      );

    if (json.status == "none") {
      await player.setLoop("track");
      ws.send(
        JSON.stringify({
          guild: player.guildId,
          op: "loop_queue",
          status: "track",
        }),
      );
    }

    if (json.status == "track") {
      await player.setLoop("queue");
      ws.send(
        JSON.stringify({
          guild: player.guildId,
          op: "loop_queue",
          status: "queue",
        }),
      );
    }

    if (json.status == "queue") {
      await player.setLoop("none");
      ws.send(
        JSON.stringify({
          guild: player.guildId,
          op: "loop_queue",
          status: "none",
        }),
      );
    }
  },
};
