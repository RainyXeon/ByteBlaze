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
  name = "voldown";
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

    const reply_msg = `${client.i18n.get(language, "player", "voldown_msg", {
      volume: `${player.volume * 100 - 10}`,
    })}`;

    if (player.volume <= 0.1) {
      await new ReplyInteractionService(
        client,
        message,
        `${client.i18n.get(language, "music", "volume_invalid")}`
      );
      return;
    }

    player.setVolume(player.volume * 100 - 10);

    this.setVol247(client, player, player.volume * 100 - 10);

    await new ReplyInteractionService(client, message, reply_msg);
    return;
  }

  async setVol247(client: Manager, player: KazagumoPlayer, vol: number) {
    if (await client.db.autoreconnect.get(player.guildId)) {
      await client.db.autoreconnect.set(`${player.guildId}.config.volume`, vol);
    }
  }
}
