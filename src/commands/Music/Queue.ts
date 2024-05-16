import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { PageQueue } from "../../structures/PageQueue.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["queue"];
  public description = "Show the queue of songs.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "<page_number>";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [
    {
      name: "page",
      description: "Page number to show.",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0];

    if (value && isNaN(+value))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
            .setColor(client.color),
        ],
      });

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const song = player.queue.current;
    const qduration = `${new FormatDuration().parse(song!.duration + player.queue.duration)}`;
    const thumbnail = `https://img.youtube.com/vi/${song!.identifier}/hqdefault.jpg`;

    let pagesNum = Math.ceil(player.queue.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < player.queue.length; i++) {
      const song = player.queue[i];
      songStrings.push(
        `**${i + 1}.** ${this.getTitle(client, song)} \`[${new FormatDuration().parse(song.duration)}]\``
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("\n");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(handler.language, "command.music", "queue_author", {
            guild: handler.guild!.name,
          })}`,
        })
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setDescription(
          `${client.getString(handler.language, "command.music", "queue_description", {
            title: this.getTitle(client, song!),
            request: String(song!.requester),
            duration: new FormatDuration().parse(song!.duration),
            rest: str == "" ? "  Nothing" : "\n" + str,
          })}`
        )
        .setFooter({
          text: `${client.getString(handler.language, "command.music", "queue_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            queue_lang: String(player.queue.length),
            duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    if (!value) {
      if (pages.length == pagesNum && player.queue.length > 10) {
        if (handler.message) {
          await new PageQueue(client, pages, 60000, player.queue.length, handler.language).prefixPage(
            handler.message,
            qduration
          );
        } else if (handler.interaction) {
          await new PageQueue(client, pages, 60000, player.queue.length, handler.language).slashPage(
            handler.interaction,
            qduration
          );
        } else return;
      } else return handler.editReply({ embeds: [pages[0]] });
    } else {
      if (isNaN(+value))
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(handler.language, "command.music", "queue_notnumber")}`)
              .setColor(client.color),
          ],
        });
      if (Number(value) > pagesNum)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.getString(handler.language, "command.music", "queue_page_notfound", {
                  page: String(pagesNum),
                })}`
              )
              .setColor(client.color),
          ],
        });
      const pageNum = Number(value) == 0 ? 1 : Number(value) - 1;
      return handler.editReply({ embeds: [pages[pageNum]] });
    }
  }

  getTitle(client: Manager, tracks: RainlinkTrack): string {
    if (client.config.lavalink.AVOID_SUSPEND) return tracks.title;
    else {
      return `[${tracks.title}](${tracks.uri})`;
    }
  }
}
