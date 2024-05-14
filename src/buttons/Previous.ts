import { ButtonInteraction, CacheType, InteractionCollector, Message } from "discord.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";
import { RainlinkPlayer } from "../rainlink/main.js";

export default class implements PlayerButton {
  name = "replay";
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
    const previousIndex = player.queue.previous.length - 1;

    if (player.queue.previous.length == 0 || previousIndex === -1)
      return new ReplyInteractionService(
        client,
        message,
        `${client.getString(language, "button.music", "previous_notfound")}`
      );

    player.previous();

    player.data.set("endMode", "previous");

    new ReplyInteractionService(client, message, `${client.getString(language, "button.music", "previous_msg")}`);
    return;
  }
}
