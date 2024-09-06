import { User } from 'discord.js'
import { Manager } from '../../manager.js'
import { RainlinkPlayer } from 'rainlink'

export default class {
  async execute(client: Manager, player: RainlinkPlayer) {
    const song = player.queue.current
    const requesterQueue = song && song.requester ? (song!.requester as User) : null

    const currentData = song
      ? {
          title: song!.title,
          uri: song!.uri,
          length: song!.duration,
          thumbnail: song!.artworkUrl,
          author: song!.author,
          requester: requesterQueue
            ? {
                id: requesterQueue.id,
                username: requesterQueue.username,
                globalName: requesterQueue.globalName,
                defaultAvatarURL: requesterQueue.defaultAvatarURL ?? null,
              }
            : null,
        }
      : null

    client.wsl.get(player.guildId)?.send({
      op: 'trackStart',
      guild: player.guildId,
      data: currentData,
    })
  }
}
