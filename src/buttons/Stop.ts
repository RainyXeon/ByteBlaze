import { ButtonInteraction, CacheType, InteractionCollector, Message } from "discord.js";
import { KazagumoPlayer } from "../lib/main.js";
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
    collector.stop();

    player.data.set("sudo-destroy", true);
    player.destroy();

    await new ReplyInteractionService(
      client,
      message,
      `${client.i18n.get(language, "button.music", "stop_msg")}`
    );
  }
}
