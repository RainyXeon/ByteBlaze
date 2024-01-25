import {
  ButtonInteraction,
  CacheType,
  InteractionCollector,
  Message,
} from "discord.js";
import { KazagumoPlayer } from "../lib/main.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import {
  playerRowOne,
  playerRowOneEdited,
  playerRowTwo,
} from "../assets/PlayerControlButton.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";

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

    const newPlayer = await player.pause(!player.paused);

    newPlayer.paused
      ? nplaying.edit({
          components: [playerRowOneEdited, playerRowTwo],
        })
      : nplaying.edit({
          components: [playerRowOne, playerRowTwo],
        });

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(
        language,
        "player",
        newPlayer.paused ? "pause_msg" : "resume_msg"
      )}`
    );

    client.emit("playerPause", player);
  }
}
