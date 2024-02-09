import { KazagumoPlayer } from "../../lib/main.js";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (!client.websocket) return;
    const song = player.queue.current;

    const currentData = {
      title: song!.title,
      uri: song!.uri,
      length: song!.length,
      thumbnail: song!.thumbnail,
      author: song!.author,
      requester: song!.requester,
    };

    client.websocket.send(
      JSON.stringify({
        op: "player_start",
        guild: player.guildId,
        current: currentData,
      })
    );
  }
}
