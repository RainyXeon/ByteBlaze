import { Manager } from "../../manager.js";

export default {
  name: "queue",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.players.get(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );

    let webqueue = [];

    const song = player.queue.current;

    await player.queue.forEach((track) => {
      webqueue.push({
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    await webqueue.unshift({
      title: song!.title,
      uri: song!.uri,
      length: song!.length,
      thumbnail: song!.thumbnail,
      author: song!.author,
      requester: song!.requester,
    });

    await client.websocket.send(
      JSON.stringify({
        op: "player_queue",
        guild: player.guildId,
        queue: webqueue || [],
      }),
    );
  },
};
