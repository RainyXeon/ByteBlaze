import { ButtonInteraction, CacheType, InteractionCollector, Message } from "discord.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";
import { RainlinkPlayer } from "../rainlink/main.js";

export default class implements PlayerButton {
  name = "skip";
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

    if (player.queue.size == 0 && player.data.get("autoplay") !== true)
      return new ReplyInteractionService(
        client,
        message,
        `${client.getString(language, "button.music", "skip_notfound")}`
      );

    player.skip();

    new ReplyInteractionService(client, message, `${client.getString(language, "button.music", "skip_msg")}`);
  }
}
