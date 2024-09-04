import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  AutocompleteInteraction,
} from 'discord.js'
import { convertTime } from '../../utilities/ConvertTime.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'
import { AutocompleteInteractionChoices, GlobalInteraction } from '../../@types/Interaction.js'
import { RainlinkSearchResultType, RainlinkTrack } from 'rainlink'

const TrackAdd: RainlinkTrack[] = []

export default class implements Command {
  public name = ['pl', 'add']
  public description = 'Add song to a playlist'
  public category = 'Playlist'
  public accessableby = [Accessableby.Member]
  public usage = '<playlist_id> <url_or_name>'
  public aliases = []
  public lavalink = true
  public playerCheck = false
  public usingInteraction = true
  public sameVoiceCheck = false
  public permissions = []

  public options = [
    {
      name: 'id',
      description: 'The id of the playlist',
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: 'search',
      description: 'The song link or name',
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ]

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    const maxLength = await client.db.maxlength.get(handler.user.id)

    const value = handler.args[0] ? handler.args[0] : null
    if (value == null || !value)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.playlist', 'invalid')}`)
            .setColor(client.color),
        ],
      })

    const input = handler.args[1]

    const Inputed = input

    if (!input)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.playlist', 'add_match')}`)
            .setColor(client.color),
        ],
      })

    const result = await client.rainlink.search(input, {
      requester: handler.user,
    })
    const tracks = result.tracks.filter((e) => (maxLength ? e.duration > maxLength : e))

    if (!result.tracks.length)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.playlist', 'add_match')}`)
            .setColor(client.color),
        ],
      })
    if (result.type === 'PLAYLIST') for (let track of tracks) TrackAdd.push(track)
    else TrackAdd.push(tracks[0])

    const Duration = convertTime(tracks[0].duration as number)
    const TotalDuration = tracks.reduce(
      (acc, cur) => acc + (cur.duration || 0),
      tracks[0].duration ?? 0
    )

    if (result.type === 'PLAYLIST') {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, 'command.playlist', 'add_playlist', {
            title: this.getTitle(client, result.type, tracks, Inputed),
            duration: convertTime(TotalDuration),
            track: String(tracks.length),
            user: String(handler.user),
          })}`
        )
        .setColor(client.color)
      handler.editReply({ content: ' ', embeds: [embed] })
    } else if (result.type === 'TRACK') {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, 'command.playlist', 'add_track', {
            title: this.getTitle(client, result.type, tracks),
            duration: Duration,
            user: String(handler.user),
          })}`
        )
        .setColor(client.color)
      handler.editReply({ content: ' ', embeds: [embed] })
    } else if (result.type === 'SEARCH') {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, 'command.playlist', 'add_search', {
            title: this.getTitle(client, result.type, tracks),
            duration: Duration,
            user: String(handler.user),
          })}`
        )
        .setColor(client.color)
      handler.editReply({ content: ' ', embeds: [embed] })
    } else {
      //The playlist link is invalid.
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.playlist', 'add_match')}`)
            .setColor(client.color),
        ],
      })
    }

    const playlist = await client.db.playlist.get(value)

    if (!playlist)
      return handler.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.playlist', 'invalid')}`)
            .setColor(client.color),
        ],
      })

    if (playlist.owner !== handler.user?.id) {
      handler.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.playlist', 'add_owner')}`)
            .setColor(client.color),
        ],
      })
      TrackAdd.length = 0
      return
    }
    const LimitTrack = playlist.tracks!.length + TrackAdd.length

    if (LimitTrack > client.config.player.LIMIT_TRACK) {
      handler.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, 'command.playlist', 'add_limit_track', {
                limit: String(client.config.player.LIMIT_TRACK),
              })}`
            )
            .setColor(client.color),
        ],
      })
      TrackAdd.length = 0
      return
    }

    TrackAdd.forEach(async (track) => {
      await client.db.playlist.push(`${value}.tracks`, {
        title: track.title,
        uri: track.uri,
        length: track.duration,
        thumbnail: track.artworkUrl,
        author: track.author,
        requester: track.requester, // Just case can push
      })
    })

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, 'command.playlist', 'add_added', {
          count: String(TrackAdd.length),
          playlist: value,
        })}`
      )
      .setColor(client.color)

    handler.followUp({ content: ' ', embeds: [embed] })
    TrackAdd.length = 0
  }

  getTitle(
    client: Manager,
    type: RainlinkSearchResultType,
    tracks: RainlinkTrack[],
    value?: string
  ): string {
    if (client.config.player.AVOID_SUSPEND) return tracks[0].title
    else {
      if (type === 'PLAYLIST') {
        return `[${tracks[0].title}](${value})`
      } else {
        return `[${tracks[0].title}](${tracks[0].uri})`
      }
    }
  }

  // Autocomplete function
  public async autocomplete(client: Manager, interaction: GlobalInteraction, language: string) {
    let choice: AutocompleteInteractionChoices[] = []
    const url = String((interaction as CommandInteraction).options.get('search')!.value)

    const maxLength = await client.db.maxlength.get(interaction.user.id)

    const Random =
      client.config.player.AUTOCOMPLETE_SEARCH[
        Math.floor(Math.random() * client.config.player.AUTOCOMPLETE_SEARCH.length)
      ]

    const match = client.REGEX.some((match) => {
      return match.test(url) == true
    })

    if (match == true) {
      choice.push({ name: url, value: url })
      await (interaction as AutocompleteInteraction).respond(choice).catch(() => {})
      return
    }

    if (client.lavalinkUsing.length == 0) {
      choice.push({
        name: `${client.i18n.get(language, 'error', 'no_node')}`,
        value: `${client.i18n.get(language, 'error', 'no_node')}`,
      })
      return
    }
    const searchRes = await client.rainlink.search(url || Random)

    const tracks = searchRes.tracks.filter((e) =>
      typeof maxLength !== 'string' ? e.duration > maxLength : e
    )

    if (tracks.length == 0 || !searchRes.tracks) {
      return choice.push({ name: 'Error song not matches', value: url })
    }

    for (let i = 0; i < 10; i++) {
      const x = tracks[i]
      choice.push({
        name: x && x.title ? x.title : 'Unknown track name',
        value: x && x.uri ? x.uri : url,
      })
    }

    await (interaction as AutocompleteInteraction).respond(choice).catch(() => {})
  }
}
