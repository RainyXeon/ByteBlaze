import {
  ButtonInteraction,
  CacheType,
  InteractionCollector,
  Message,
} from "discord.js";
import { KazagumoPlayer } from "kazagumo.mod";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";

export default class implements PlayerButton {
  name = "stop";
  async run(
    client: Manager,
    message: ButtonInteraction<CacheType>,
    language: string,
    player: KazagumoPlayer,
    nplaying: Message<boolean>,
    collector: InteractionCollector<ButtonInteraction<"cached">>
  ): Promise<any> {
    const newPlayer = await client.manager.players.get(message.guildId!);
    if (!newPlayer) {
      return collector.stop();
    }

    newPlayer.destroy();

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "player", "stop_msg")}`
    );
  }
}
