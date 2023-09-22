import { ContextMenuCommandInteraction, GuildMember } from 'discord.js'
import { EmbedBuilder, ApplicationCommandType } from 'discord.js'
import { Manager } from '../../../manager.js'
import { KazagumoLoopMode } from '../../../types/Lavalink.js'

export default {
  name: ['Loop'],
  type: ApplicationCommandType.Message,
  category: 'Context',

  run: async (
    interaction: ContextMenuCommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false })
    const msg = await interaction.editReply(
      `${client.i18n.get(language, 'music', 'loopall_loading')}`
    )

    const player = client.manager.players.get(interaction.guild!.id)
    if (!player)
      return msg.edit(`${client.i18n.get(language, 'noplayer', 'no_player')}`)
    const { channel } = (interaction.member as GuildMember)!.voice
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, 'noplayer', 'no_voice')}`)

    const loop_mode = {
      none: 'none',
      track: 'track',
      queue: 'queue',
    }

    if (player.loop === 'none') {
      await player.setLoop(loop_mode.queue as KazagumoLoopMode)
      const looped_queue = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, 'music', 'loop_all')}`)
        .setColor(client.color)
      msg.edit({ content: ' ', embeds: [looped_queue] })
    } else if (player.loop === 'queue') {
      await player.setLoop(loop_mode.none as KazagumoLoopMode)
      const looped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, 'music', 'unloop_all')}`)
        .setColor(client.color)
      msg.edit({ content: ' ', embeds: [looped] })
    }
  },
}
