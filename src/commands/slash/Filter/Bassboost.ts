import {
  EmbedBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  ApplicationCommandOptionType,
} from 'discord.js'
import delay from 'delay'
import { Manager } from '../../../manager.js'

export default {
  name: ['filter', 'bassboost'],
  description: 'Turning on bassboost filter',
  category: 'Filter',
  options: [
    {
      name: 'amount',
      description: 'The amount of the bassboost',
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false })
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger('amount')
    const player = client.manager.players.get(interaction.guild!.id)
    if (!player)
      return interaction.editReply(
        `${client.i18n.get(language, 'noplayer', 'no_player')}`
      )
    const { channel } = (interaction.member as GuildMember).voice
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return interaction.editReply(
        `${client.i18n.get(language, 'noplayer', 'no_voice')}`
      )

    if (!value) {
      const data = {
        op: 'filters',
        guildId: interaction.guild!.id,
        equalizer: [
          { band: 0, gain: 0.1 },
          { band: 1, gain: 0.1 },
          { band: 2, gain: 0.05 },
          { band: 3, gain: 0.05 },
          { band: 4, gain: -0.05 },
          { band: 5, gain: -0.05 },
          { band: 6, gain: 0 },
          { band: 7, gain: -0.05 },
          { band: 8, gain: -0.05 },
          { band: 9, gain: 0 },
          { band: 10, gain: 0.05 },
          { band: 11, gain: 0.05 },
          { band: 12, gain: 0.1 },
          { band: 13, gain: 0.1 },
        ],
      }

      await player['send'](data)

      const msg1 = await interaction.editReply(
        `${client.i18n.get(language, 'filters', 'filter_loading', {
          name: client.commands.get('bassboost').config.name,
        })}`
      )
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, 'filters', 'filter_on', {
            name: client.commands.get('bassboost').config.name,
          })}`
        )
        .setColor(client.color)

      await delay(2000)
      return msg1.edit({ content: ' ', embeds: [embed] })
    }

    if (isNaN(value))
      return interaction.editReply(
        `${client.i18n.get(language, 'filters', 'filter_number')}`
      )
    if (value > 10 || value < -10)
      return interaction.editReply(
        `${client.i18n.get(language, 'filters', 'bassboost_limit')}`
      )
    const data = {
      op: 'filters',
      guildId: interaction.guild!.id,
      equalizer: [
        { band: 0, gain: value / 10 },
        { band: 1, gain: value / 10 },
        { band: 2, gain: value / 10 },
        { band: 3, gain: value / 10 },
        { band: 4, gain: value / 10 },
        { band: 5, gain: value / 10 },
        { band: 6, gain: value / 10 },
        { band: 7, gain: 0 },
        { band: 8, gain: 0 },
        { band: 9, gain: 0 },
        { band: 10, gain: 0 },
        { band: 11, gain: 0 },
        { band: 12, gain: 0 },
        { band: 13, gain: 0 },
      ],
    }
    await player['send'](data)
    const msg2 = await interaction.editReply(
      `${client.i18n.get(language, 'filters', 'bassboost_loading', {
        amount: String(value),
      })}`
    )
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, 'filters', 'bassboost_set', {
          amount: String(value),
        })}`
      )
      .setColor(client.color)

    await delay(2000)
    return msg2.edit({ content: ' ', embeds: [embed] })
  },
}
