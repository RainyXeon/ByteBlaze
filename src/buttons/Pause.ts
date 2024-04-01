import { ButtonInteraction, CacheType, InteractionCollector, Message } from "discord.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { playerRowOne, playerRowOneEdited, playerRowTwo } from "../assets/PlayerControlButton.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";
import { RainlinkPlayer } from "../rainlink/main.js";

export default class implements PlayerButton {
  name = "pause";
  async run(
    client: Manager,
    message: ButtonInteraction<CacheType>,
    language: string,
    player: RainlinkPlayer,
    nplaying: Message<boolean>,
    collector: InteractionCollector<ButtonInteraction<"cached">>
  ): Promise<any> {
    if (!player) {
      collector.stop();
    }

    const newPlayer = await player.setPause(!player.paused);

    newPlayer.paused
      ? nplaying.edit({
          components: [playerRowOneEdited, playerRowTwo],
        })
      : nplaying.edit({
          components: [playerRowOne, playerRowTwo],
        });

    new ReplyInteractionService(
      client,
      message,
      `${client.getString(language, "button.music", newPlayer.paused ? "pause_msg" : "resume_msg")}`
    );
  }
}
