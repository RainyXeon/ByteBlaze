import { ButtonInteraction, CacheType, InteractionCollector, Message } from "discord.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";
import { RainlinkPlayer } from "../rainlink/main.js";

export default class implements PlayerButton {
  name = "volup";
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

    const reply_msg = `${client.getString(language, "button.music", "volup_msg", {
      volume: `${player.volume + 10}`,
    })}`;

    if (player.volume >= 100) {
      new ReplyInteractionService(client, message, `${client.getString(language, "button.music", "volume_max")}`);
      return;
    }

    player.setVolume(player.volume + 10);

    client.wsl.get(message.guild!.id)?.send({
      op: "playerVolume",
      guild: message.guild!.id,
      volume: player.volume,
    });

    new ReplyInteractionService(client, message, reply_msg);
    return;
  }
}
