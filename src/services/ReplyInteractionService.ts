import { EmbedBuilder, ButtonInteraction } from 'discord.js'
import { Manager } from '../manager.js'

export class ReplyInteractionService {
  constructor(
    protected client: Manager,
    protected message: ButtonInteraction,
    protected content: string
  ) {
    this.execute()
  }

  async execute() {
    const embed = new EmbedBuilder().setDescription(this.content).setColor(this.client.color)

    const msg = await this.message
      .reply({
        embeds: [embed],
        ephemeral: false,
      })
      .catch(() => null)
    const setup = await this.client.db.setup.get(String(this.message.guildId))

    setTimeout(() => {
      (!setup || setup == null || setup.channel !== this.message.channelId) && msg
        ? msg.delete().catch(() => null)
        : true
    }, this.client.config.utilities.DELETE_MSG_TIMEOUT)
  }
}
