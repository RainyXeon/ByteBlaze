import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { KazagumoPlayer, KazagumoTrack } from "kazagumo.mod";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

// Main code
export default class implements Command {
  public name = ["remove-duplicate"];
  public description = "Remove duplicated song from queue";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["rmd", "rm-dup"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(
      handler.guild!.id
    ) as KazagumoPlayer;

    let OriginalQueueLength = player.queue.length;

    for (let i = 0; i < player.queue.length; i++) {
      const element = player.queue[i];
      if (player.queue.current!.uri == element.uri) {
        const track_index = player.queue.indexOf(
          player.queue.current as KazagumoTrack
        );
        player.queue.splice(track_index, 1);
      }
    }

    const unique = [...new Map(player.queue.map((m) => [m.uri, m])).values()];

    player.queue.clear();
    player.queue.push(...unique);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(
          handler.language,
          "music",
          "removetrack_duplicate_desc",
          {
            original: String(OriginalQueueLength),
            new: String(unique.length),
            removed: String(OriginalQueueLength - unique.length),
          }
        )}`
      )
      .setColor(client.color);

    await handler.editReply({ embeds: [embed] });

    OriginalQueueLength = 0;
    return;
  }
}
