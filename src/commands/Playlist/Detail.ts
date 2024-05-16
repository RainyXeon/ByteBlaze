import { EmbedBuilder, ApplicationCommandOptionType, Message } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { PageQueue } from "../../structures/PageQueue.js";
import { Manager } from "../../manager.js";
import { PlaylistTrack } from "../../database/schema/Playlist.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pl", "detail"];
  public description = "View all your playlists";
  public category = "Playlist";
  public accessableby = [Accessableby.Member];
  public usage = "<playlist_id> <number>";
  public aliases = [];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "id",
      description: "The id of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "page",
      description: "The page you want to view",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0] ? handler.args[0] : null;
    const number = handler.args[1];

    if (number && isNaN(+number))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
            .setColor(client.color),
        ],
      });

    if (!value)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "detail_notfound")}`)
            .setColor(client.color),
        ],
      });

    const playlist = await client.db.playlist.get(value!);

    if (!playlist)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "detail_notfound")}`)
            .setColor(client.color),
        ],
      });
    if (playlist.private && playlist.owner !== handler.user?.id)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "detail_private")}`)
            .setColor(client.color),
        ],
      });

    let pagesNum = Math.ceil(playlist.tracks!.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const playlistStrings = [];
    for (let i = 0; i < playlist.tracks!.length; i++) {
      const playlists = playlist.tracks![i];
      playlistStrings.push(
        `${client.getString(handler.language, "command.playlist", "detail_track", {
          num: String(i + 1),
          title: this.getTitle(client, playlists),
          author: String(playlists.author),
          duration: new FormatDuration().parse(playlists.length),
        })}
                `
      );
    }

    const totalDuration = new FormatDuration().parse(
      playlist.tracks!.reduce((acc: number, cur: PlaylistTrack) => acc + cur.length!, 0)
    );

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = playlistStrings.slice(i * 10, i * 10 + 10).join(`\n`);
      const embed = new EmbedBuilder() //${playlist.name}'s Playlists
        .setAuthor({
          name: `${client.getString(handler.language, "command.playlist", "detail_embed_title", {
            name: playlist.name,
          })}`,
          iconURL: handler.user?.displayAvatarURL(),
        })
        .setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
        .setColor(client.color) //Page • ${i + 1}/${pagesNum} | ${playlist.tracks.length} • Songs | ${totalDuration} • Total duration
        .setFooter({
          text: `${client.getString(handler.language, "command.playlist", "detail_embed_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            songs: String(playlist.tracks!.length),
            duration: totalDuration,
          })}`,
        });

      pages.push(embed);
    }
    if (!number) {
      if (pages.length == pagesNum && playlist.tracks!.length > 10) {
        if (handler.message) {
          await new PageQueue(client, pages, 30000, playlist.tracks!.length, handler.language).prefixPage(
            handler.message,
            totalDuration
          );
        } else if (handler.interaction) {
          await new PageQueue(client, pages, 30000, playlist.tracks!.length, handler.language).slashPage(
            handler.interaction,
            totalDuration
          );
        }
      } else return handler.editReply({ embeds: [pages[0]] });
    } else {
      if (isNaN(+number))
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(handler.language, "command.playlist", "detail_notnumber")}`)
              .setColor(client.color),
          ],
        });
      if (Number(number) > pagesNum)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.getString(handler.language, "command.playlist", "detail_page_notfound", {
                  page: String(pagesNum),
                })}`
              )
              .setColor(client.color),
          ],
        });
      const pageNum = Number(number) == 0 ? 1 : Number(number) - 1;
      return handler.editReply({ embeds: [pages[pageNum]] });
    }
  }

  getTitle(client: Manager, tracks: PlaylistTrack): string {
    if (client.config.lavalink.AVOID_SUSPEND) return String(tracks.title);
    else {
      return `[${tracks.title}](${tracks.uri})`;
    }
  }
}
