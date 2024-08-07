import { ApplicationCommandOptionType, EmbedBuilder, Message } from 'discord.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'

export default class implements Command {
  public name = ['blacklist']
  public description = 'Shuts down the client!'
  public category = 'Owner'
  public accessableby = [Accessableby.Owner]
  public usage = '< id > < add / remmove > < user/ guild >'
  public aliases = []
  public lavalink = false
  public usingInteraction = true
  public playerCheck = false
  public sameVoiceCheck = false
  public permissions = []
  public options = [
    {
      name: 'id',
      description: 'Action for this user or guild',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'action',
      description: 'Action for this user or guild',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'Add',
          value: 'add',
        },
        {
          name: 'Remove',
          value: 'remove',
        },
      ],
    },
    {
      name: 'type',
      description: 'User or Guild',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'User',
          value: 'user',
        },
        {
          name: 'Guild',
          value: 'guild',
        },
      ],
    },
  ]

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()

    const id = handler.args[0]
    const mode = handler.args[1] as 'add' | 'remove'
    const type = handler.args[2] as 'user' | 'guild'

    if (!this.options[1].choices.find((e) => e.value == mode))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_invalid_mode'))
            .setColor(client.color),
        ],
      })
    if (!this.options[2].choices.find((e) => e.value == type))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_invalid_type'))
            .setColor(client.color),
        ],
      })

    if (mode == 'remove') return this.removeData(client, handler, id, type)

    await client.db.blacklist.set(`${type}_${id}`, true)

    const restart = new EmbedBuilder()
      .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_add', { id }))
      .setColor(client.color)

    await handler.editReply({ embeds: [restart] })
  }

  protected async removeData(
    client: Manager,
    handler: CommandHandler,
    id: string,
    type: 'user' | 'guild'
  ) {
    await client.db.blacklist.delete(`${type}_${id}`)
    const remove = new EmbedBuilder()
      .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_remove', { id }))
      .setColor(client.color)
    await handler.editReply({ embeds: [remove] })
  }
}
