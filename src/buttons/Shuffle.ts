import {
  ButtonInteraction,
  CacheType,
  EmbedBuilder,
  InteractionCollector,
  Message,
} from "discord.js";
import { KazagumoPlayer } from "../lib/main.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { ReplyInteractionService } from "../services/ReplyInteractionService.js";
import { FormatDuration } from "../utilities/FormatDuration.js";
import { PageQueue } from "../structures/PageQueue.js";

export default class implements PlayerButton {
  name = "shuffle";
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

    const newQueue = await player.queue.shuffle();

    const song = newQueue.current;
    const qduration = `${new FormatDuration().parse(song!.length)}`;
    const thumbnail = `https://img.youtube.com/vi/${
      song!.identifier
    }/hqdefault.jpg`;

    let pagesNum = Math.ceil(newQueue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < newQueue.length; i++) {
      const song = newQueue[i];
      songStrings.push(
        `**${i + 1}.** [${song.title}](${
          song.uri
        }) \`[${new FormatDuration().parse(song.length)}]\`
        `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(language, "music", "shuffle_msg")}`,
        })
        .setDescription(
          `${client.i18n.get(language, "player", "queue_description", {
            track: song!.title,
            track_url: String(song!.uri),
            duration: new FormatDuration().parse(song?.length),
            requester: `${song!.requester}`,
            list_song: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(language, "player", "queue_footer", {
            page: `${i + 1}`,
            pages: `${pagesNum}`,
            queue_lang: `${newQueue.length}`,
            total_duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    if (pages.length == pagesNum && newQueue.length > 10) {
      await new PageQueue(
        client,
        pages,
        60000,
        newQueue.length,
        language
      ).buttonPage(message, qduration);
    } else message.reply({ embeds: [pages[0]], ephemeral: true });
  }
}
