import {
  ButtonInteraction,
  CacheType,
  InteractionCollector,
  Message,
} from "discord.js";
import { KazagumoPlayer } from "../lib/main.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { KazagumoLoop } from "../@types/Lavalink.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";

export default class implements PlayerButton {
  name = "loop";
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

    async function setLoop247(loop: string) {
      if (await client.db.autoreconnect.get(player.guildId)) {
        await client.db.autoreconnect.set(
          `${player.guildId}.config.loop`,
          loop
        );
      }
    }

    switch (player.loop) {
      case "none":
        await player.setLoop(KazagumoLoop.track);

        setLoop247(String(KazagumoLoop.none));

        new ReplyInteractionService(
          client,
          message,
          `${client.i18n.get(language, "music", "loop_current")}`
        );

        break;

      case "track":
        await player.setLoop(KazagumoLoop.queue);

        setLoop247(String(KazagumoLoop.none));

        new ReplyInteractionService(
          client,
          message,
          `${client.i18n.get(language, "music", "loop_all")}`
        );

        break;

      case "queue":
        await player.setLoop(KazagumoLoop.none);

        setLoop247(String(KazagumoLoop.none));

        new ReplyInteractionService(
          client,
          message,
          `${client.i18n.get(language, "music", "unloop_all")}`
        );

        break;
    }
  }
}
