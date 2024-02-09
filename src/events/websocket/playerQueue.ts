import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.websocket) return;

    const song = player.queue.current;
    let webqueue = [];

    player.queue.forEach((track) => {
      webqueue.push({
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    webqueue.unshift({
      title: song!.title,
      uri: song!.uri,
      length: song!.length,
      thumbnail: song!.thumbnail,
      author: song!.author,
      requester: song!.requester,
    });

    if (!client.sentQueue.get(player.guildId)) {
      client.websocket.send(
        JSON.stringify({
          op: "player_queue",
          guild: player.guildId,
          queue: webqueue || [],
        })
      );
      client.sentQueue.set(player.guildId, true);
    }
  }
}
