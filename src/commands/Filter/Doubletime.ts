import { EmbedBuilder } from 'discord.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'

export default class implements Command {
  public name = ['doubletime']
  public description = 'Turning on doubletime filter'
  public category = 'Filter'
  public accessableby = [Accessableby.Member]
  public usage = ''
  public aliases = ['doubletime']
  public lavalink = true
  public options = []
  public playerCheck = true
  public usingInteraction = true
  public sameVoiceCheck = true
  public permissions = []

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    const player = client.rainlink.players.get(handler.guild!.id)

    if (player?.data.get('filter-mode') == this.name[0])
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, 'command.filter', 'filter_already', {
                name: this.name[0],
              })}`
            )
            .setColor(client.color),
        ],
      })

    player?.data.set('filter-mode', this.name[0])
    player?.filter.set('doubletime')

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, 'command.filter', 'filter_on', {
          name: this.name[0],
        })}`
      )
      .setColor(client.color)
    await handler.editReply({ content: ' ', embeds: [embed] })
  }
}
