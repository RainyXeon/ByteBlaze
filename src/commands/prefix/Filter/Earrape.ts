import { EmbedBuilder, Message } from 'discord.js'
import delay from 'delay'
import { Manager } from '../../../manager.js'

export default {
  name: 'earrape',
  description: 'Destroy your ear!',
  category: 'Filter',
  usage: '',
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, 'filters', 'filter_loading', {
        name: 'earrape',
      })}`
    )

    const player = client.manager.players.get(message.guild!.id)
    if (!player)
      return msg.edit(`${client.i18n.get(language, 'noplayer', 'no_player')}`)
    const { channel } = message.member!.voice
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, 'noplayer', 'no_voice')}`)

    await player.setVolume(500)
    const data = {
      op: 'filters',
      guildId: message.guild!.id,
    }
    await player['send'](data)

    const earrapped = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, 'filters', 'filter_on', {
          name: 'earrape',
        })}`
      )
      .setColor(client.color)

    await delay(2000)
    msg.edit({ content: ' ', embeds: [earrapped] })
  },
}
