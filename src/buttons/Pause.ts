import {
  ButtonInteraction,
  CacheType,
  InteractionCollector,
  Message,
} from "discord.js";
import { KazagumoPlayer } from "kazagumo.mod";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import {
  playerRowOne,
  playerRowOneEdited,
  playerRowTwo,
} from "../utilities/PlayerControlButton.js";
import { ReplyInteractionService } from "../utilities/ReplyInteractionService.js";

export default class implements PlayerButton {
  name = "pause";
  async run(
    client: Manager,
    message: ButtonInteraction<CacheType>,
    language: string,
    player: KazagumoPlayer,
    nplaying: Message<boolean>,
    collector: InteractionCollector<ButtonInteraction<"cached">>
  ): Promise<any> {
    if (!player) {
      collector.stop();
    }
    await player.pause(!player.paused);
    const uni = player.paused
      ? `${client.i18n.get(language, "player", "switch_pause")}`
      : `${client.i18n.get(language, "player", "switch_resume")}`;

    player.paused
      ? nplaying.edit({
          components: [playerRowOneEdited, playerRowTwo],
        })
      : nplaying.edit({
          components: [playerRowOne, playerRowTwo],
        });

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "player", "pause_msg", {
        pause: uni,
      })}`
    );

    client.emit("playerPause", player);
  }
}
