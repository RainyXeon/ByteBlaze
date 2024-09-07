import { ButtonInteraction, CacheType, InteractionCollector, Message } from 'discord.js'
import { PlayerButton } from '../@types/Button.js'
import { Manager } from '../manager.js'
import {
  filterSelect,
  playerRowOne,
  playerRowOneEdited,
  playerRowTwo,
} from '../utilities/PlayerControlButton.js'
import { ReplyInteractionService } from '../services/ReplyInteractionService.js'
import { RainlinkPlayer } from 'rainlink'

export default class implements PlayerButton {
  name = 'pause'
  async run(
    client: Manager,
    message: ButtonInteraction<CacheType>,
    language: string,
    player: RainlinkPlayer,
    nplaying: Message<boolean>,
    collector?: InteractionCollector<ButtonInteraction<'cached'>>
  ): Promise<any> {
    if (!player && collector) {
      collector.stop()
    }

    player.data.set('pause-from-button', true)

    const newPlayer = await player.setPause(!player.paused)

    newPlayer.paused
      ? nplaying
          .edit({
            components: [
              filterSelect(client, false),
              playerRowOneEdited(client, false),
              playerRowTwo(client, false),
            ],
          })
          .catch(() => null)
      : nplaying
          .edit({
            components: [
              filterSelect(client, false),
              playerRowOne(client, false),
              playerRowTwo(client, false),
            ],
          })
          .catch(() => null)

    new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, 'button.music', newPlayer.paused ? 'pause_msg' : 'resume_msg')}`
    )
  }
}
