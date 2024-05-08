import { User } from "discord.js";
import { Manager } from "../../manager.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    const song = player.queue.previous.at(-1);
    const requesterQueue = song!.requester as User;

    const currentData = song
      ? {
          title: song.title,
          uri: song.uri,
          length: song.duration,
          thumbnail: song.artworkUrl,
          author: song.author,
          requester: requesterQueue
            ? {
                id: requesterQueue.id,
                username: requesterQueue.username,
                globalName: requesterQueue.globalName,
                defaultAvatarURL: requesterQueue.defaultAvatarURL ?? null,
              }
            : null,
        }
      : null;

    client.wsl.get(player.guildId)?.send({
      op: "playerEnd",
      guild: player.guildId,
      data: currentData,
      mode: player.data.get("endMode") ?? "normal",
    });
  }
}
