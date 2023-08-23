import { Manager } from "../../manager.js";

export default {
  name: "status.playing",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );
    if (player.state == 5)
      return ws.send(
        JSON.stringify({ op: "player_destroy", guild: player.guildId }),
      );
    else if (player.state == 1)
      return ws.send(
        JSON.stringify({ op: "player_create", guild: player.guildId }),
      );
  },
};
