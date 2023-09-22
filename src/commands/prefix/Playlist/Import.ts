import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  Message,
} from 'discord.js'
import { convertTime } from '../../../structures/ConvertTime.js'
import { Manager } from '../../../manager.js'
import { PlaylistInterface } from '../../../types/Playlist.js'
let playlist: PlaylistInterface | null

export default {
  name: 'playlist-import',
  description: 'Import a playlist to queue.',
  category: 'Playlist',
  usage: '<playlist_name_or_id>',
  aliases: ['pl-import'],
  lavalink: true,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const value = args[0] ? args[0] : null
    const id = value ? null : args[0]

    if (value == null || id == null)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'invalid')}`
      )

    const { channel } = message.member!.voice
    if (!channel)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'import_voice')}`
      )
    if (
      !message
        .guild!.members.cache!.get(client.user!.id)!
        .permissionsIn(channel)
        .has(PermissionsBitField.Flags.Connect)
    )
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'import_join')}`
      )
    if (
      !message
        .guild!.members.cache!.get(client.user!.id)!
        .permissionsIn(channel)
        .has(PermissionsBitField.Flags.Speak)
    )
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'import_speak')}`
      )

    const player = await client.manager.createPlayer({
      guildId: message.guild!.id,
      voiceId: message.member!.voice.channel!.id,
      textId: message.channel.id,
      deaf: true,
    })

    const SongAdd = []
    let SongLoad = 0

    if (id) playlist = await client.db.get(`playlist.pid_${id}`)
    if (value) {
      const Plist = value.replace(/_/g, ' ')

      const fullList = await client.db.get('playlist')

      const pid = Object.keys(fullList).filter(function (key) {
        return (
          fullList[key].owner == message.author.id &&
          fullList[key].name == Plist
        )
      })

      playlist = fullList[pid[0]]
    }
    if (!id && !value)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'no_id_or_name')}`
      )
    if (id && value)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'got_id_and_name')}`
      )
    if (!playlist)
      return message.channel.send(
        `${client.i18n.get(language, 'playlist', 'invalid')}`
      )

    if (playlist.private && playlist.owner !== message.author.id) {
      message.channel.send(
        `${client.i18n.get(language, 'playlist', 'import_private')}`
      )
      return
    }

    const totalDuration = convertTime(
      playlist.tracks!.reduce((acc, cur) => acc + cur.length!, 0)
    )

    const msg = await message.channel.send(
      `${client.i18n.get(language, 'playlist', 'import_loading')}`
    )

    for (let i = 0; i < playlist.tracks!.length; i++) {
      const res = await player.search(playlist.tracks![i].uri, {
        requester: message.author,
      })
      if (res.type == 'TRACK') {
        SongAdd.push(res.tracks[0])
        SongLoad++
      } else if (res.type == 'PLAYLIST') {
        for (let t = 0; t < res.tracks.length; t++) {
          SongAdd.push(res.tracks[t])
          SongLoad++
        }
      } else if (res.type == 'SEARCH') {
        SongAdd.push(res.tracks[0])
        SongLoad++
      }
      if (SongLoad == playlist.tracks!.length) {
        player.queue.add(SongAdd)
        const embed = new EmbedBuilder() // **Imported • \`${Plist}\`** (${playlist.tracks.length} tracks) • ${message.author}
          .setDescription(
            `${client.i18n.get(language, 'playlist', 'import_imported', {
              name: playlist.name,
              tracks: String(playlist.tracks!.length),
              duration: totalDuration,
              user: String(message.author),
            })}`
          )
          .setColor(client.color)

        msg.edit({ content: ' ', embeds: [embed] })
        if (!player.playing) {
          player.play()
        }
      }
    }
  },
}
