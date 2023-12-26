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
    await player.send({
      guildId: message.guild!.id,
      playerOptions: {
        position: 0,
      },
    });

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "player", "replay_msg")}`
    );
    return;
  }
}
