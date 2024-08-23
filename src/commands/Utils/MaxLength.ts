import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'
import { RainlinkPlayer } from '../../rainlink/main.js'
const time_regex = /(^[0-9][\d]{0,3}):(0[0-9]{1}$|[1-5]{1}[0-9])/

// Main code
export default class implements Command {
  public name = ['max-length']
  public description = 'Set the max length of the song allowed'
  public category = 'Music'
  public accessableby = [Accessableby.Member]
  public usage = '<time_format. Ex: 999:59>'
  public aliases = []
  public lavalink = false
  public playerCheck = false
  public usingInteraction = true
  public sameVoiceCheck = false
  public permissions = []
  public options = [
    {
      name: 'time',
      description: 'Set the max length or none. Example: 0:10 or 120:10',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ]

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    let value: number
    const time = handler.args[0]

    if (time == 'none' || time == '0:00') {
      await client.db.maxlength.delete(handler.user.id)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.utils', 'ml_remove')}`)
            .setColor(client.color),
        ],
      })
    }

    if (!time_regex.test(time))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, 'command.utils', 'ml_invalid')}`)
            .setColor(client.color),
        ],
      })
    else {
      const [m, s] = time.split(/:/)
      const min = Number(m) * 60
      const sec = Number(s)
      value = min + sec
    }

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer

    if (player && player.queue.length !== 0)
      player.queue.forEach((track, trackIndex) => {
        if (track.duration >= value) player.queue.remove(trackIndex)
      })

    await client.db.maxlength.set(handler.user.id, value)

    const embed = new EmbedBuilder()
      .setDescription(client.i18n.get(handler.language, 'command.utils', 'ml_set', { time }))
      .setColor(client.color)
    return handler.editReply({ embeds: [embed] })
  }
}
