import { EmbedBuilder, Message } from 'discord.js'
import delay from 'delay'
import { Manager } from '../../../manager.js'

export default {
  name: 'vibrate',
  description: 'Turning on vibrate filter',
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
        name: 'vibrate',
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

    const data = {
      op: 'filters',
      guildId: message.guild!.id,
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
