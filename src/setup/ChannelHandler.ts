import { Manager } from '../manager.js'
import {
  EmbedBuilder,
  Message,
  GuildMember,
  TextChannel,
  StringSelectMenuInteraction,
} from 'discord.js'
import { GlobalInteraction } from '../@types/Interaction.js'
import { RateLimitManager } from '@sapphire/ratelimits'
import { convertTime } from '../utilities/ConvertTime.js'
import { getTitle } from '../utilities/GetTitle.js'
import { BlacklistService } from '../services/BlacklistService.js'
import { RainlinkFilterMode } from 'rainlink'
const rateLimitManager = new RateLimitManager(2000)

/**
 * @param {Client} client
 */

export class ChannelHandler {
  client: Manager
  constructor(client: Manager) {
    this.client = client
    this.register()
  }

  register() {
    try {
      this.client.on('interactionCreate', (interaction) => this.interaction(interaction))
      this.client.on('messageCreate', (message) => this.message(message))
    } catch (err) {
      this.client.logger.error(ChannelHandler.name, err)
    }
  }

  async interaction(interaction: GlobalInteraction): Promise<void> {
    if (!interaction.guild || interaction.user.bot) return
    if (interaction.isStringSelectMenu()) {
      return this.filterSelect(interaction)
    }
    if (!interaction.isButton()) return
    const { customId } = interaction

    let player = this.client.rainlink.players.get(interaction.guild.id)
    if (!player) return

    const playChannel = await this.client.channels.fetch(player.textId).catch(() => undefined)
    if (!playChannel) return

    let guildModel = await this.client.db.language.get(`${player.guildId}`)
    if (!guildModel) {
      guildModel = await this.client.db.language.set(
        `${player.guildId}`,
        this.client.config.bot.LANGUAGE
      )
    }

    const language = guildModel

    //////////////////////////////// Blacklist check start ////////////////////////////////
    const blacklistService = new BlacklistService(this.client)
    const checkResult = await blacklistService.fullCheck(interaction.user.id, interaction.guildId)
    if (checkResult[0] && checkResult[1] == 'user') {
      const blocked = new EmbedBuilder()
        .setDescription(
          this.client.i18n.get(guildModel, 'error', 'bl_user', { bot: this.client.user.id })
        )
        .setColor(this.client.color)
      await interaction.reply({
        embeds: [blocked],
      })
      return
    }
    if (checkResult[0] && checkResult[1] == 'guild') {
      const blocked = new EmbedBuilder()
        .setDescription(
          this.client.i18n.get(guildModel, 'error', 'bl_guild', { bot: this.client.user.id })
        )
        .setColor(this.client.color)

      await interaction.reply({
        embeds: [blocked],
      })
      return
    }
    //////////////////////////////// Blacklist check end ////////////////////////////////
    const button = this.client.plButton.get(customId)

    let data = await this.client.db.setup.get(`${player.guildId}`)
    if (!data) return
    if (data.enable === false) return

    const getChannel = await this.client.channels.fetch(data.channel).catch(() => undefined)
    if (!getChannel) return

    let playMsg = await (getChannel as TextChannel)!.messages
      .fetch(data.playmsg)
      .catch(() => undefined)

    if (!playMsg) return

    if (button) {
      try {
        await button.run(this.client, interaction, String(language), player, playMsg)
      } catch (err) {
        this.client.logger.error('ButtonError', err)
      }
    }
  }

  async filterSelect(interaction: StringSelectMenuInteraction): Promise<void> {
    if (!interaction.guild || interaction.user.bot) return

    let player = this.client.rainlink.players.get(interaction.guild.id)
    if (!player) return

    const playChannel = await this.client.channels.fetch(player.textId).catch(() => undefined)
    if (!playChannel) return

    let guildModel = await this.client.db.language.get(`${player.guildId}`)
    if (!guildModel) {
      guildModel = await this.client.db.language.set(
        `${player.guildId}`,
        this.client.config.bot.LANGUAGE
      )
    }

    const language = guildModel

    const filterMode = interaction.values[0] as RainlinkFilterMode

    if (player.data.get('filter-mode') == filterMode) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(language, 'button.music', 'filter_already', { name: filterMode })}`
        )
        .setColor(this.client.color)
      await interaction
        .reply({
          embeds: [embed],
        })
        .catch(() => {})
      return
    }

    if (filterMode == 'clear' && !player.data.get('filter-mode')) {
      const embed = new EmbedBuilder()
        .setDescription(`${this.client.i18n.get(language, 'button.music', 'reset_already')}`)
        .setColor(this.client.color)
      await interaction
        .reply({
          embeds: [embed],
        })
        .catch(() => {})
      return
    }

    filterMode == 'clear'
      ? player.data.delete('filter-mode')
      : player.data.set('filter-mode', filterMode)
    filterMode == 'clear' ? await player.filter.clear() : await player.filter.set(filterMode)

    const embed = new EmbedBuilder()
      .setDescription(
        filterMode == 'clear'
          ? `${this.client.i18n.get(language, 'button.music', 'reset_on')}`
          : `${this.client.i18n.get(language, 'button.music', 'filter_on', { name: filterMode })}`
      )
      .setColor(this.client.color)

    await interaction
      .reply({
        embeds: [embed],
      })
      .catch(() => {})
  }

  async message(message: Message): Promise<any> {
    if (!message.guild || !message.guild.available || !message.channel.isTextBased()) return
    let database = await this.client.db.setup.get(`${message.guild.id}`)
    let player = this.client.rainlink.players.get(`${message.guild.id}`)

    if (!database) return

    if (!database!.enable) return

    let channel = (await message.guild.channels
      .fetch(database!.channel)
      .catch(() => undefined)) as TextChannel
    if (!channel) return

    if (database!.channel != message.channel.id) return

    let guildModel = await this.client.db.language.get(`${message.guild.id}`)
    if (!guildModel) {
      guildModel = await this.client.db.language.set(
        `${message.guild.id}`,
        this.client.config.bot.LANGUAGE
      )
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
      }, this.client.config.utilities.DELETE_MSG_TIMEOUT)
    }

    if (message.author.bot) return

    const song = message.cleanContent
    if (!song) return

    const ratelimit = rateLimitManager.acquire(message.author.id)

    if (ratelimit.limited) return

    ratelimit.consume()

    const blacklistService = new BlacklistService(this.client)
    const checkResult = await blacklistService.fullCheck(message.author.id, message.guildId)
    if (checkResult[0] && checkResult[1] == 'user') {
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              this.client.i18n.get(guildModel, 'error', 'bl_user', { bot: this.client.user.id })
            )
            .setColor(this.client.color),
        ],
      })
      return false
    }
    if (checkResult[0] && checkResult[1] == 'guild') {
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              this.client.i18n.get(guildModel, 'error', 'bl_guild', { bot: this.client.user.id })
            )
            .setColor(this.client.color),
        ],
      })
      return false
    }

    let voiceChannel = message.member!.voice.channel
    if (!voiceChannel)
      return (message.channel as TextChannel).send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${this.client.i18n.get(language, 'error', 'no_in_voice')}`)
            .setColor(this.client.color),
        ],
      })

    let msg = await message.channel.messages.fetch(database!.playmsg).catch(() => undefined)

    const emotes = (str: string) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu)

    if (emotes(song) !== null) {
      msg?.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${this.client.i18n.get(language, 'event.setup', 'play_emoji')}`)
            .setColor(this.client.color),
        ],
      })
      return
    }

    if (!player)
      player = await this.client.rainlink.create({
        guildId: message.guild.id,
        voiceId: message.member!.voice.channel!.id,
        textId: message.channel.id,
        shardId: message.guild.shardId,
        deaf: true,
        volume: this.client.config.player.DEFAULT_VOLUME,
      })
    else {
      if (message.member!.voice.channel !== message.guild!.members.me!.voice.channel) {
        msg?.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${this.client.i18n.get(language, 'error', 'no_same_voice')}`)
              .setColor(this.client.color),
          ],
        })
        return
      }
    }

    const maxLength = await this.client.db.maxlength.get(message.author.id)

    const result = await player.search(song, { requester: message.author })
    const tracks = result.tracks.filter((e) => (maxLength ? e.duration > maxLength : e))

    if (!result.tracks.length) {
      msg
        ?.edit({
          content: `${this.client.i18n.get(language, 'event.setup', 'setup_content')}\n${`${this.client.i18n.get(
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
          `${this.client.i18n.get(language, 'event.setup', 'play_playlist', {
            title: getTitle(this.client, result.tracks[0]),
            duration: convertTime(TotalDuration),
            songs: `${result.tracks.length}`,
            request: `${result.tracks[0].requester}`,
          })}`
        )
        .setColor(this.client.color)
      msg?.reply({ content: ' ', embeds: [embed] })
    } else if (result.type === 'TRACK') {
      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(language, 'event.setup', 'play_track', {
            title: getTitle(this.client, result.tracks[0]),
            duration: convertTime(result.tracks[0].duration as number),
            request: `${result.tracks[0].requester}`,
          })}`
        )
        .setColor(this.client.color)
      msg?.reply({ content: ' ', embeds: [embed] })
    } else if (result.type === 'SEARCH') {
      const embed = new EmbedBuilder().setColor(this.client.color).setDescription(
        `${this.client.i18n.get(language, 'event.setup', 'play_result', {
          title: getTitle(this.client, result.tracks[0]),
          duration: convertTime(result.tracks[0].duration as number),
          request: `${result.tracks[0].requester}`,
        })}`
      )
      msg?.reply({ content: ' ', embeds: [embed] })
    }

    await this.client.UpdateQueueMsg(player)
  }
}
