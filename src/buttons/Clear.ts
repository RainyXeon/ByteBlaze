import { ButtonInteraction, CacheType, InteractionCollector, Message } from "discord.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";
import { RainlinkPlayer } from "../rainlink/main.js";

export default class implements PlayerButton {
  name = "clear";
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
    player.queue.clear();

    new ReplyInteractionService(client, message, `${client.getString(language, "button.music", "clear_msg")}`);

    client.wsl.get(message.guild!.id)?.send({
      op: "playerClearQueue",
      guild: message.guild!.id,
    });

    return;
  }
}
