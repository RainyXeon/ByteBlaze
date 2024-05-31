import {
  ButtonInteraction,
  CacheType,
  EmbedBuilder,
  InteractionCollector,
  Message,
} from "discord.js";
import { PlayerButton } from "../@types/Button.js";
import { Manager } from "../manager.js";
import { formatDuration } from "../utilities/FormatDuration.js";
import { RainlinkPlayer } from "../rainlink/main.js";
import { getTitle } from "../utilities/GetTitle.js";

export default class implements PlayerButton {
  name = "queue";
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
    const song = player.queue.current;
    const qduration = `${formatDuration(song!.duration + player.queue.duration)}`;
    const thumbnail =
      song?.artworkUrl ?? `https://img.youtube.com/vi/${song!.identifier}/hqdefault.jpg`;

    let pagesNum = Math.ceil(player.queue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < player.queue.length; i++) {
      const song = player.queue[i];
      songStrings.push(
        `**${i + 1}.** ${getTitle(client, song)} \`[${formatDuration(song.duration)}]\`
        `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "button.music", "queue_author", {
            guild: message.guild!.name,
          })}`,
        })
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "button.music", "queue_description", {
            track: getTitle(client, song!),
            duration: formatDuration(song?.duration),
            requester: `${song!.requester}`,
            list_song: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.i18n.get(language, "button.music", "queue_footer", {
            page: `${i + 1}`,
            pages: `${pagesNum}`,
            queue_lang: `${player.queue.length}`,
            total_duration: qduration,
          })}`,
        });

      pages.push(embed);
    }
    message.reply({ embeds: [pages[0]], ephemeral: true });
  }
}
