import { Manager } from "../../manager.js"

export default {
  name: "seek",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild)

    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      )

    await player.seek(json.position * 1000)

    ws.send(
      JSON.stringify({
        op: "sync_position",
        guild: player.guildId,
        position: player.shoukaku.position,
      })
    )
  },
}
