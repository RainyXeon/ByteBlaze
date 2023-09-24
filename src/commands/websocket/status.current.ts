import { Manager } from "../../manager.js"
import { PlaylistTrackInterface } from "../../types/Playlist.js"

export default {
  name: "status.current_track",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild)

    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" })
      )

    const song = player.queue.current
    let webqueue: PlaylistTrackInterface[] = []

    player.queue.forEach((track) => {
      webqueue.push({
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      })
    })

    return ws.send(
      JSON.stringify({
        op: "player_start",
        guild: player.guildId,
        current: {
          title: song!.title,
          uri: song!.uri,
          length: song!.length,
          thumbnail: song!.thumbnail,
          author: song!.author,
          requester: song!.requester,
        },
        queue: webqueue,
      })
    )
  },
}
