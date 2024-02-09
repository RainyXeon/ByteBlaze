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
  name = "skip";
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

    if (player.queue.size == 0)
      return await new ReplyInteractionService(
        client,
        message,
        `${client.i18n.get(language, "music", "skip_notfound")}`
      );

    player.skip();

    client.emit("playerSkip", player);

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "player", "skip_msg")}`
    );
  }
}
