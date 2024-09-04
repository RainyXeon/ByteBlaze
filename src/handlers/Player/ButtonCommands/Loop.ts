import { ButtonInteraction, EmbedBuilder } from 'discord.js'
import { Manager } from '../../../manager.js'
import { AutoReconnectBuilderService } from '../../../services/AutoReconnectBuilderService.js'
import { RainlinkLoopMode, RainlinkPlayer } from 'rainlink'

export class ButtonLoop {
  client: Manager
  interaction: ButtonInteraction
  language: string
  player: RainlinkPlayer
  constructor(
    client: Manager,
    interaction: ButtonInteraction,
    language: string,
    player: RainlinkPlayer
  ) {
    this.client = client
    this.language = language
    this.player = player
    this.interaction = interaction
    this.execute()
  }

  async execute() {
    if (!this.player) {
      return
    }

    switch (this.player.loop) {
      case 'none':
        this.player.setLoop(RainlinkLoopMode.SONG)

        if (this.client.config.utilities.AUTO_RESUME) this.setLoop247(String(RainlinkLoopMode.SONG))

        const looptrack = new EmbedBuilder()
          .setDescription(`${this.client.i18n.get(this.language, 'button.music', 'loop_current')}`)
          .setColor(this.client.color)
        await this.interaction.reply({
          content: ' ',
          embeds: [looptrack],
        })

        this.client.wsl.get(this.interaction.guild!.id)?.send({
          op: 'playerLoop',
          guild: this.interaction.guild!.id,
          mode: 'song',
        })
        break

      case 'song':
        this.player.setLoop(RainlinkLoopMode.QUEUE)

        if (this.client.config.utilities.AUTO_RESUME)
          this.setLoop247(String(RainlinkLoopMode.QUEUE))

        const loopall = new EmbedBuilder()
          .setDescription(`${this.client.i18n.get(this.language, 'button.music', 'loop_all')}`)
          .setColor(this.client.color)
        await this.interaction.reply({
          content: ' ',
          embeds: [loopall],
        })

        this.client.wsl.get(this.interaction.guild!.id)?.send({
          op: 'playerLoop',
          guild: this.interaction.guild!.id,
          mode: 'queue',
        })
        break

      case 'queue':
        this.player.setLoop(RainlinkLoopMode.NONE)

        if (this.client.config.utilities.AUTO_RESUME) this.setLoop247(String(RainlinkLoopMode.NONE))

        const unloopall = new EmbedBuilder()
          .setDescription(`${this.client.i18n.get(this.language, 'button.music', 'unloop_all')}`)
          .setColor(this.client.color)
        await this.interaction.reply({
          content: ' ',
          embeds: [unloopall],
        })

        this.client.wsl.get(this.interaction.guild!.id)?.send({
          op: 'playerLoop',
          guild: this.interaction.guild!.id,
          mode: 'none',
        })
        break
    }
  }

  async setLoop247(loop: string) {
    const check = await new AutoReconnectBuilderService(this.client, this.player).execute(
      this.player.guildId
    )
    if (check) {
      await this.client.db.autoreconnect.set(`${this.player.guildId}.config.loop`, loop)
    }
  }
}
