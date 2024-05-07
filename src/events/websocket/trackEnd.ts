import { Manager } from "../../manager.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    if (!client.websocket) return;

    const prevoiusIndex = player.queue.previous.length - 1;

    const song = player.queue.previous[prevoiusIndex === -1 ? 0 : prevoiusIndex];

    const currentData = song
      ? {
          title: song.title,
          uri: song.uri,
          length: song.duration,
          thumbnail: song.artworkUrl,
          author: song.author,
          requester: song.requester,
        }
      : null;

    client.websocket.send(
      JSON.stringify({
        op: "playerEnd",
        guild: player.guildId,
        data: currentData,
      })
    );
  }
}
