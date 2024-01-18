import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.websocket) return;

    const prevoiusIndex = player.queue.previous.length - 1;

    const song =
      player.queue.previous[prevoiusIndex === -1 ? 0 : prevoiusIndex];

    const currentData = song
      ? {
          title: song.title,
          uri: song.uri,
          length: song.length,
          thumbnail: song.thumbnail,
          author: song.author,
          requester: song.requester,
        }
      : null;

    await client.websocket.send(
      JSON.stringify({
        op: "player_end",
        guild: player.guildId,
        track: currentData,
      })
    );
  }
}
