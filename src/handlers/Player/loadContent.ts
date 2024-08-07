import { Manager } from '../../manager.js'
import { EmbedBuilder, Message, GuildMember, TextChannel } from 'discord.js'
import { GlobalInteraction } from '../../@types/Interaction.js'
// Button Commands
import { ButtonPrevious } from './ButtonCommands/Previous.js'
import { ButtonSkip } from './ButtonCommands/Skip.js'
import { ButtonStop } from './ButtonCommands/Stop.js'
import { ButtonLoop } from './ButtonCommands/Loop.js'
import { ButtonPause } from './ButtonCommands/Pause.js'
import { RateLimitManager } from '@sapphire/ratelimits'
import { convertTime } from '../../utilities/ConvertTime.js'
import { getTitle } from '../../utilities/GetTitle.js'
import { BlacklistService } from '../../services/BlacklistService.js'
const rateLimitManager = new RateLimitManager(2000)

/**
 * @param {Client} client
 */

export class PlayerContentLoader {
  client: Manager
  constructor(client: Manager) {
    this.client = client
    this.register()
  }

  register() {
    try {
      this.client.on('interactionCreate', this.interaction.bind(null, this.client))
      this.client.on('messageCreate', this.message.bind(null, this.client))
    } catch (err) {
      this.client.logger.error(PlayerContentLoader.name, err)
    }
  }

  async interaction(client: Manager, interaction: GlobalInteraction): Promise<void> {
    if (!interaction.guild || interaction.user.bot) return
    if (!interaction.isButton()) return
    const { customId, member } = interaction
    let voiceMember = await interaction.guild.members
      .fetch((member as GuildMember)!.id)
      .catch(() => undefined)
    let channel = voiceMember!.voice.channel

    let player = client.rainlink.players.get(interaction.guild.id)
    if (!player) return

    const playChannel = await client.channels.fetch(player.textId).catch(() => undefined)
    if (!playChannel) return

    let guildModel = await client.db.language.get(`${player.guildId}`)
    if (!guildModel) {
      guildModel = await client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE)
    }

    const language = guildModel

    //////////////////////////////// Blacklist check start ////////////////////////////////
    const blacklistService = new BlacklistService(client)
    const checkResult = await blacklistService.fullCheck(interaction.user.id, interaction.guildId)
    if (checkResult[0] && checkResult[1] == 'user') {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `You have been blocked from using Dreamvast, please contact the owner to resolve`
            )
            .setColor(client.color),
        ],
      })
      return
    }
    if (checkResult[0] && checkResult[1] == 'guild') {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `This server has been blocked from using Dreamvast, please contact the owner to resolve or use another server`
            )
            .setColor(client.color),
        ],
      })
      return
    }
    //////////////////////////////// Blacklist check end ////////////////////////////////

    switch (customId) {
      case 'sprevious':
        new ButtonPrevious(client, interaction, channel, language, player)
        break
      case 'sskip':
        new ButtonSkip(client, interaction, channel, language, player)
        break
      case 'sstop':
        new ButtonStop(client, interaction, channel, language, player)
        break
      case 'sloop':
        new ButtonLoop(client, interaction, language, player)
        break
      case 'spause':
        new ButtonPause(client, interaction, channel, language, player)
        break
      default:
        break
    }
  }

  async message(client: Manager, message: Message): Promise<any> {
    if (!message.guild || !message.guild.available || !message.channel.isTextBased()) return
    let database = await client.db.setup.get(`${message.guild.id}`)
    let player = client.rainlink.players.get(`${message.guild.id}`)

    if (!database) return

    if (!database!.enable) return

    let channel = (await message.guild.channels
      .fetch(database!.channel)
      .catch(() => undefined)) as TextChannel
    if (!channel) return

    if (database!.channel != message.channel.id) return

    let guildModel = await client.db.language.get(`${message.guild.id}`)
    if (!guildModel) {
      guildModel = await client.db.language.set(`${message.guild.id}`, client.config.bot.LANGUAGE)
    }

    const language = guildModel

    if (message.id !== database.playmsg) {
      const preInterval = setInterval(async () => {
        const fetchedMessage = await message.channel.messages
          .fetch({ limit: 50 })
          .catch(() => undefined)
        if (!fetchedMessage) {
          clearInterval(preInterval)
          return
        }
        const final = fetchedMessage.filter((msg) => msg.id !== database?.playmsg)
        if (final.size > 0) (message.channel as TextChannel).bulkDelete(final).catch(() => {})
        else clearInterval(preInterval)
      }, client.config.utilities.DELETE_MSG_TIMEOUT)
    }

    if (message.author.bot) return

    const song = message.cleanContent
    if (!song) return

    const ratelimit = rateLimitManager.acquire(message.author.id)

    if (ratelimit.limited) return

    ratelimit.consume()

    const blacklistService = new BlacklistService(client)
    const checkResult = await blacklistService.fullCheck(message.author.id, message.guildId)
    if (checkResult[0] && checkResult[1] == 'user') {
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `You have been blocked from using Dreamvast, please contact the owner to resolve`
            )
            .setColor(client.color),
        ],
      })
      return false
    }
    if (checkResult[0] && checkResult[1] == 'guild') {
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `This server has been blocked from using Dreamvast, please contact the owner to resolve or use another server`
            )
            .setColor(client.color),
        ],
      })
      return false
    }

    let voiceChannel = await message.member!.voice.channel
    if (!voiceChannel)
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, 'error', 'no_in_voice')}`)
            .setColor(client.color),
        ],
      })

    let msg = await message.channel.messages.fetch(database!.playmsg).catch(() => undefined)

    const emotes = (str: string) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu)

    if (emotes(song) !== null) {
      msg?.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, 'event.setup', 'play_emoji')}`)
            .setColor(client.color),
        ],
      })
      return
    }

    if (!player)
      player = await client.rainlink.create({
        guildId: message.guild.id,
        voiceId: message.member!.voice.channel!.id,
        textId: message.channel.id,
        shardId: message.guild.shardId,
        deaf: true,
        volume: client.config.player.DEFAULT_VOLUME,
      })
    else {
      if (message.member!.voice.channel !== message.guild!.members.me!.voice.channel) {
        msg?.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.i18n.get(language, 'error', 'no_same_voice')}`)
              .setColor(client.color),
          ],
        })
        return
      }
    }

    const result = await player.search(song, { requester: message.author })
    const tracks = result.tracks

    if (!result.tracks.length) {
      msg
        ?.edit({
          content: `${client.i18n.get(language, 'event.setup', 'setup_content')}\n${`${client.i18n.get(
            language,
            'event.setup',
            'setup_content_empty'
          )}`}`,
        })
        .catch(() => null)
      return
    }
    if (result.type === 'PLAYLIST') for (let track of tracks) player.queue.add(track)
    else if (player.playing && result.type === 'SEARCH') player.queue.add(tracks[0])
    else if (player.playing && result.type !== 'SEARCH')
      for (let track of tracks) player.queue.add(track)
    else player.queue.add(tracks[0])

    const TotalDuration = player.queue.duration

    if (!player.playing) player.play()

    if (result.type === 'PLAYLIST') {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, 'event.setup', 'play_playlist', {
            title: getTitle(client, result.tracks[0]),
            duration: convertTime(TotalDuration),
            songs: `${result.tracks.length}`,
            request: `${result.tracks[0].requester}`,
          })}`
        )
        .setColor(client.color)
      msg?.reply({ content: ' ', embeds: [embed] })
    } else if (result.type === 'TRACK') {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, 'event.setup', 'play_track', {
            title: getTitle(client, result.tracks[0]),
            duration: convertTime(result.tracks[0].duration as number),
            request: `${result.tracks[0].requester}`,
          })}`
        )
        .setColor(client.color)
      msg?.reply({ content: ' ', embeds: [embed] })
    } else if (result.type === 'SEARCH') {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, 'event.setup', 'play_result', {
          title: getTitle(client, result.tracks[0]),
          duration: convertTime(result.tracks[0].duration as number),
          request: `${result.tracks[0].requester}`,
        })}`
      )
      msg?.reply({ content: ' ', embeds: [embed] })
    }

    await client.UpdateQueueMsg(player)
  }
}
