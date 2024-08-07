import { EmbedBuilder, Message } from 'discord.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'

export default class implements Command {
  public name = ['earrape']
  public description = 'Turning on earrape filter (extended by rainy)'
  public category = 'Filter'
  public accessableby = [Accessableby.Member]
  public usage = ''
  public aliases = ['earrape']
  public lavalink = true
  public options = []
  public playerCheck = true
  public usingInteraction = true
  public sameVoiceCheck = true
  public permissions = []

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    const player = client.rainlink.players.get(handler.guild!.id)

    if (player?.data.get('filter-mode') == this.name[0]) {
      const filterInvalid = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, 'command.filter', 'filter_already', {
            name: this.name[0],
          })}`
        )
        .setColor(client.color)

      return handler.editReply({
        embeds: [filterInvalid],
      })
    }

    player?.data.set('filter-mode', this.name[0])
    player?.filter.setVolume(500)

    const earrapped = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, 'command.filter', 'filter_on', {
          name: this.name[0],
        })}`
      )
      .setColor(client.color)
    await handler.editReply({ content: ' ', embeds: [earrapped] })
  }
}
