import {
  ButtonInteraction,
  CacheType,
  InteractionCollector,
  Message,
} from "discord.js";
import { KazagumoPlayer } from "../lib/main.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";

export default class implements PlayerButton {
  name = "replay";
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
    const previousIndex = player.queue.previous.length - 1;

    if (player.queue.previous.length == 0 || previousIndex === -1)
      return await new ReplyInteractionService(
        client,
        message,
        `${client.i18n.get(language, "music", "previous_notfound")}`
      );

    player.previous();

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "music", "previous_msg")}`
    );
    return;
  }
}
