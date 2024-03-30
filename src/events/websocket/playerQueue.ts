import { Manager } from "../../manager.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    if (!client.websocket) return;

    const song = player.queue.current;
    let webqueue = [];

    player.queue.forEach((track) => {
      webqueue.push({
        title: track.title,
        uri: track.uri,
        length: track.duration,
        thumbnail: track.artworkUrl,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    webqueue.unshift({
      title: song!.title,
      uri: song!.uri,
      length: song!.duration,
      thumbnail: song!.artworkUrl,
      author: song!.author,
      requester: song!.requester,
    });

    if (!client.sentQueue.get(player.guildId)) {
      client.websocket.send(
        JSON.stringify({
          op: "playerQueue",
          guild: player.guildId,
          queue: webqueue || [],
        })
      );
      client.sentQueue.set(player.guildId, true);
    }
  }
}
