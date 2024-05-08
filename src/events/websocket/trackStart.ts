import { Manager } from "../../manager.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    const song = player.queue.current;

    const currentData = {
      title: song!.title,
      uri: song!.uri,
      length: song!.duration,
      thumbnail: song!.artworkUrl,
      author: song!.author,
      requester: song!.requester,
    };

    client.wsl.get(player.guildId)?.send({
      op: "trackStart",
      guild: player.guildId,
      data: currentData,
    });
  }
}
