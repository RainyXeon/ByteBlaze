import {
  ButtonInteraction,
  CacheType,
  EmbedBuilder,
  InteractionCollector,
  Message,
  User,
} from 'discord.js'
import { PlayerButton } from '../@types/Button.js'
import { Manager } from '../manager.js'
import { formatDuration } from '../utilities/FormatDuration.js'
import { PageQueue } from '../structures/PageQueue.js'
import { RainlinkPlayer } from '../rainlink/main.js'
import { getTitle } from '../utilities/GetTitle.js'

export default class implements PlayerButton {
  name = 'shuffle'
  async run(
    client: Manager,
    message: ButtonInteraction<CacheType>,
    language: string,
    player: RainlinkPlayer,
    nplaying: Message<boolean>,
    collector: InteractionCollector<ButtonInteraction<'cached'>>
  ): Promise<any> {
    if (!player) {
      collector.stop()
    }

    const newQueue = player.queue.shuffle()

    const song = newQueue.current
    const qduration = `${formatDuration(song!.duration + player.queue.duration)}`
    const thumbnail =
      song?.artworkUrl ?? `https://img.youtube.com/vi/${song!.identifier}/hqdefault.jpg`

    let pagesNum = Math.ceil(newQueue.length / 10)
    if (pagesNum === 0) pagesNum = 1

    const songStrings = []
    for (let i = 0; i < newQueue.length; i++) {
      const song = newQueue[i]
      songStrings.push(
        `**${i + 1}.** ${getTitle(client, song)} \`[${formatDuration(song.duration)}]\`
        `
      )
    }

    const pages = []
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join('')

      const embed = new EmbedBuilder()
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(language, 'button.music', 'shuffle_msg')}`,
        })
        .setDescription(
          `${client.i18n.get(language, 'button.music', 'queue_description', {
            track: getTitle(client, song!),
            duration: formatDuration(song?.duration),
            requester: `${song!.requester}`,
            list_song: str == '' ? '  Nothing' : '\n' + str,
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(language, 'button.music', 'queue_footer', {
            page: `${i + 1}`,
            pages: `${pagesNum}`,
            queue_lang: `${newQueue.length}`,
            total_duration: qduration,
          })}`,
        })

      pages.push(embed)
    }

    client.wsl.get(message.guild!.id)?.send({
      op: 'playerQueueShuffle',
      guild: message.guild!.id,
      queue: player.queue.map((track) => {
        const requesterQueue = track.requester as User
        return {
          title: track.title,
          uri: track.uri,
          length: track.duration,
          thumbnail: track.artworkUrl,
          author: track.author,
          requester: requesterQueue
            ? {
                id: requesterQueue.id,
                username: requesterQueue.username,
                globalName: requesterQueue.globalName,
                defaultAvatarURL: requesterQueue.defaultAvatarURL ?? null,
              }
            : null,
        }
      }),
    })

    if (pages.length == pagesNum && newQueue.length > 10) {
      await new PageQueue(client, pages, 60000, newQueue.length, language).buttonPage(
        message,
        qduration
      )
    } else message.reply({ embeds: [pages[0]], ephemeral: true })
  }
}
