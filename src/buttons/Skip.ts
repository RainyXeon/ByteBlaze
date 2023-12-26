import {
  ButtonInteraction,
  CacheType,
  InteractionCollector,
  Message,
} from "discord.js";
import { KazagumoPlayer } from "kazagumo.mod";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../utilities/ReplyInteractionService.js";

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
    player.skip();

    client.emit("playerSkip", player);

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "player", "skip_msg")}`
    );
  }
}
