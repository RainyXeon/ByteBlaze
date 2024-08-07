import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'
import { RainlinkFilterData, RainlinkFilterMode } from '../../rainlink/main.js'

export default class implements Command {
  public name = ['filter']
  public description = 'Turning on some built-in filter'
  public category = 'Filter'
  public accessableby = [Accessableby.Member]
  public usage = '<filter_name>'
  public aliases = []
  public lavalink = true
  public playerCheck = true
  public usingInteraction = true
  public sameVoiceCheck = true
  public permissions = []
  public options = [
    {
      name: 'name',
      description: 'The name of filter',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ]

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    const filterList = Object.keys(RainlinkFilterData).filter((e) => e !== 'clear')

    const filterName = handler.args[0]

    const player = client.rainlink.players.get(handler.guild!.id)

    if (!filterName || !filterList.find((e) => e == filterName)) {
      const filterInvalid = new EmbedBuilder()
        .setDescription(
          client.i18n.get(handler.language, 'command.filter', 'filter_avaliable', {
            amount: String(filterList.length),
            list: filterList.join(', '),
          })
        )
        .setColor(client.color)

      return handler.editReply({ embeds: [filterInvalid] })
    }

    if (!player?.data.get('filter-mode')) {
      const filterReset = new EmbedBuilder()
        .setDescription(`${client.i18n.get(handler.language, 'command.filter', 'reset_already')}`)
        .setColor(client.color)

      return handler.editReply({
        embeds: [filterReset],
      })
    }

    if (player?.data.get('filter-mode') == filterName) {
      const filterInvalid = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, 'command.filter', 'filter_already', {
            name: filterName,
          })}`
        )
        .setColor(client.color)

      return handler.editReply({
        embeds: [filterInvalid],
      })
    }

    player?.data.set('filter-mode', filterName)
    player?.filter.set(filterName as RainlinkFilterMode)

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, 'command.filter', 'filter_on', {
          name: filterName,
        })}`
      )
      .setColor(client.color)

    await handler.editReply({ content: ' ', embeds: [embed] })
  }
}
