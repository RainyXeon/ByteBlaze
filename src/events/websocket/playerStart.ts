import { KazagumoPlayer } from "kazagumo.mod";
import { Manager } from "../../manager.js";

export default class {
  async execute(client: Manager, player: KazagumoPlayer) {
    if (
      client.websocket &&
      client.config.features.WEB_SERVER.websocket.enable
    ) {
      const song = player.queue.current;

      client.websocket.send(
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
        })
      );
    }
  }
}
