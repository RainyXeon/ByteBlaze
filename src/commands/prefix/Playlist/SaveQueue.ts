import { EmbedBuilder, ApplicationCommandOptionType, Message } from 'discord.js'
import { Manager } from '../../../manager.js'
import { KazagumoTrack } from 'kazagumo'

const TrackAdd: KazagumoTrack[] = []
const TrackExist: string[] = []
let Result: KazagumoTrack[] | null = null

export default {
  name: 'playlist-save-queue',
  description: 'Save the current queue to a playlist',
  category: 'Playlist',
  usage: '<playlist_name>',
  aliases: ['pl-sq', 'pl-save-queue', 'pl-save'],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const value = args[0] ? args[0] : null
    if (value == null)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'invalid')}`
      )
    const Plist = value!.replace(/_/g, ' ')
    const fullList = await client.db.get('playlist')

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == message.author.id && fullList[key].name == Plist
      )
    })

    const playlist = fullList[pid[0]]

    if (!playlist)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'savequeue_notfound')}`
      )
    if (playlist.owner !== message.author.id)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'savequeue_owner')}`
      )

    const player = client.manager.players.get(message.guild!.id)
    if (!player)
      return message.channel.send(
        `${client.i18n.get(language, 'noplayer', 'no_player')}`
      )

    const { channel } = message.member!.voice
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return message.channel.send(
        `${client.i18n.get(language, 'noplayer', 'no_voice')}`
      )

    const queue = player.queue.map((track) => track)
    const current = player.queue.current

    TrackAdd.push(current as KazagumoTrack)
    TrackAdd.push(...queue)

    if (!playlist && playlist.tracks.length === 0) Result = TrackAdd

    if (playlist.tracks) {
      for (let i = 0; i < playlist.tracks.length; i++) {
        const element = playlist.tracks[i].uri
        TrackExist.push(element)
      }
      Result = TrackAdd.filter((track) => !TrackExist.includes(track.uri))
    }

    if (Result!.length == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, 'playlist', 'savequeue_no_new_saved', {
            name: Plist,
          })}`
        )
        .setColor(client.color)
      return message.channel.send({ embeds: [embed] })
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, 'playlist', 'savequeue_saved', {
          name: Plist,
          tracks: String(queue.length + 1),
        })}`
      )
      .setColor(client.color)
    await message.channel.send({ embeds: [embed] })

    Result!.forEach(async (track) => {
      await client.db.push(`playlist.${pid[0]}.tracks`, {
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      })
    })

    TrackAdd.length = 0
    TrackExist.length = 0
    Result = null
  },
}
