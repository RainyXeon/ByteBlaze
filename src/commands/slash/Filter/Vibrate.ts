import { CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'
import delay from 'delay'
import { Manager } from '../../../manager.js'

export default {
  name: ['filter', 'vibrate'],
  description: 'Turning on vibrate filter',
  category: 'Filter',
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false })

    const msg = await interaction.editReply(
      `${client.i18n.get(language, 'filters', 'filter_loading', {
        name: 'vibrate',
      })}`
    )

    const player = client.manager.players.get(interaction.guild!.id)
    if (!player)
      return msg.edit(`${client.i18n.get(language, 'noplayer', 'no_player')}`)
    const { channel } = (interaction.member as GuildMember).voice
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, 'noplayer', 'no_voice')}`)

    const data = {
      op: 'filters',
      guildId: interaction.guild!.id,
      vibrato: {
        frequency: 4.0,
        depth: 0.75,
      },
      tremolo: {
        frequency: 4.0,
        depth: 0.75,
      },
    }

    await player['send'](data)

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, 'filters', 'filter_on', {
          name: 'vibrate',
        })}`
      )
      .setColor(client.color)

    await delay(2000)
    msg.edit({ content: ' ', embeds: [embed] })
  },
}
