import { ButtonInteraction, CacheType, InteractionCollector, Message } from "discord.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";
import { RainlinkLoopMode, RainlinkPlayer } from "../rainlink/main.js";

export default class implements PlayerButton {
  name = "loop";
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

    async function setLoop247(loop: string) {
      if (await client.db.autoreconnect.get(player.guildId)) {
        await client.db.autoreconnect.set(`${player.guildId}.config.loop`, loop);
      }
    }

    switch (player.loop) {
      case "none":
        player.setLoop(RainlinkLoopMode.SONG);

        setLoop247(RainlinkLoopMode.SONG);

        new ReplyInteractionService(client, message, `${client.getString(language, "button.music", "loop_current")}`);

        client.wsl.get(message.guild!.id)?.send({
          op: "playerLoop",
          guild: message.guild!.id,
          mode: "song",
        });

        break;

      case "song":
        player.setLoop(RainlinkLoopMode.QUEUE);

        setLoop247(RainlinkLoopMode.QUEUE);

        new ReplyInteractionService(client, message, `${client.getString(language, "button.music", "loop_all")}`);

        client.wsl.get(message.guild!.id)?.send({
          op: "playerLoop",
          guild: message.guild!.id,
          mode: "queue",
        });

        break;

      case "queue":
        player.setLoop(RainlinkLoopMode.NONE);

        setLoop247(RainlinkLoopMode.NONE);

        new ReplyInteractionService(client, message, `${client.getString(language, "button.music", "unloop_all")}`);

        client.wsl.get(message.guild!.id)?.send({
          op: "playerLoop",
          guild: message.guild!.id,
          mode: "none",
        });

        break;
    }
  }
}
