import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { PageQueue } from "../../structures/PageQueue.js";
import humanizeDuration from "humanize-duration";
import { Manager } from "../../manager.js";
import { Playlist } from "../../database/schema/Playlist.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pl", "all"];
  public description = "View all your playlists";
  public category = "Playlist";
  public accessableby = [Accessableby.Member];
  public usage = "<number>";
  public aliases = [];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "page",
      description: "The page you want to view",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const number = handler.args[0];

    const playlists: Playlist[] = [];
    const fullList = await client.db.playlist.all();

    fullList
      .filter((data) => {
        return data.value.owner == handler.user?.id;
      })
      .forEach((data) => {
        playlists.push(data.value);
      });

    let pagesNum = Math.ceil(playlists.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const playlistStrings = [];
    for (let i = 0; i < playlists.length; i++) {
      const playlist = playlists[i];
      const created = humanizeDuration(Date.now() - playlists[i].created, {
        largest: 1,
      });
      playlistStrings.push(
        `${client.getString(handler.language, "command.playlist", "view_embed_playlist", {
          num: String(i + 1),
          name: playlist.id,
          tracks: String(playlist.tracks!.length),
          create: created,
        })}
                `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = playlistStrings.slice(i * 10, i * 10 + 10).join(`\n`);
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.getString(handler.language, "command.playlist", "view_embed_title", {
            user: handler.user!.username,
          })}`,
          iconURL: handler.user?.displayAvatarURL(),
        })
        .setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
        .setColor(client.color)
        .setFooter({
          text: `${client.getString(handler.language, "command.playlist", "view_embed_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            songs: String(playlists.length),
          })}`,
        });

      pages.push(embed);
    }
    if (!number) {
      if (pages.length == pagesNum && playlists.length > 10) {
        if (handler.message) {
          await new PageQueue(client, pages, 30000, playlists.length, handler.language).prefixPlaylistPage(
            handler.message
          );
        } else if (handler.interaction) {
          await new PageQueue(client, pages, 30000, playlists.length, handler.language).slashPlaylistPage(
            handler.interaction
          );
        }
        return (playlists.length = 0);
      } else {
        await handler.editReply({ embeds: [pages[0]] });
        return (playlists.length = 0);
      }
    } else {
      if (isNaN(+number))
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(handler.language, "command.playlist", "view_notnumber")}`)
              .setColor(client.color),
          ],
        });
      if (Number(number) > pagesNum)
        return handler.editReply({
          content: `${client.getString(handler.language, "command.playlist", "view_page_notfound", {
            page: String(pagesNum),
          })}`,
        });
      const pageNum = Number(number) == 0 ? 1 : Number(number) - 1;
      await handler.editReply({ embeds: [pages[pageNum]] });
      return (playlists.length = 0);
    }
  }
}
