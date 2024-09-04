import { ButtonInteraction, InteractionCollector, Message } from 'discord.js'
import { Manager } from '../manager.js'
import { RainlinkPlayer } from 'rainlink'

export class PlayerButton {
  name: string = ''
  async run(
    client: Manager,
    message: ButtonInteraction,
    language: string,
    player: RainlinkPlayer,
    nplaying: Message,
    collector: InteractionCollector<ButtonInteraction<'cached'>>
  ): Promise<any> {}
}
