import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.websocket) return client.emit("wsFallback");

    const song = player.queue.previous[0];

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
