import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { FormatDuration } from "../../../structures/FormatDuration.js";
import { PageQueue } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";
import { PlaylistTrack } from "../../../database/schema/Playlist.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "playlist-detail";
  description = "Detail a playlist";
  category = "Playlist";
  usage = "<playlist_name> <number>";
  aliases = ["pl-detail"];
  lavalink = false;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = args[0] ? args[0] : null;
    const number = args[1];

    if (number && isNaN(+number))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const Plist = value!.replace(/_/g, " ");

    const fullList = await client.db.playlist.all();

    const filter_level_1 = fullList.filter(function (data) {
      return data.value.owner == message.author.id && data.value.name == Plist;
    });

    const playlist = await client.db.playlist.get(`${filter_level_1[0].id}`);

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "detail_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.private && playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "detail_private")}`
            )
            .setColor(client.color),
        ],
      });

    let pagesNum = Math.ceil(playlist.tracks!.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const playlistStrings = [];
    for (let i = 0; i < playlist.tracks!.length; i++) {
      const playlists = playlist.tracks![i];
      playlistStrings.push(
        `${client.i18n.get(language, "playlist", "detail_track", {
          num: String(i + 1),
          title: String(playlists.title),
          url: playlists.uri,
          author: String(playlists.author),
          duration: new FormatDuration().parse(playlists.length),
        })}
                `
      );
    }

    const totalDuration = new FormatDuration().parse(
      playlist.tracks!.reduce(
        (acc: number, cur: PlaylistTrack) => acc + cur.length!,
        0
      )
    );

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = playlistStrings.slice(i * 10, i * 10 + 10).join(`\n`);
      const embed = new EmbedBuilder() //${playlist.name}'s Playlists
        .setAuthor({
          name: `${client.i18n.get(language, "playlist", "detail_embed_title", {
            name: playlist.name,
          })}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
        .setColor(client.color) //Page • ${i + 1}/${pagesNum} | ${playlist.tracks.length} • Songs | ${totalDuration} • Total duration
        .setFooter({
          text: `${client.i18n.get(
            language,
            "playlist",
            "detail_embed_footer",
            {
              page: String(i + 1),
              pages: String(pagesNum),
              songs: String(playlist.tracks!.length),
              duration: totalDuration,
            }
          )}`,
        });

      pages.push(embed);
    }
    if (!number) {
      if (pages.length == pagesNum && playlist.tracks!.length > 10)
        await new PageQueue(
          client,
          pages,
          60000,
          playlist.tracks!.length,
          language
        ).prefixPage(message, Number(totalDuration));
      else return message.reply({ embeds: [pages[0]] });
    } else {
      if (isNaN(+number))
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "playlist", "detail_notnumber")}`
              )
              .setColor(client.color),
          ],
        });
      if (Number(number) > pagesNum)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(
                  language,
                  "playlist",
                  "detail_page_notfound",
                  {
                    page: String(pagesNum),
                  }
                )}`
              )
              .setColor(client.color),
          ],
        });
      const pageNum = Number(number) == 0 ? 1 : Number(number) - 1;
      return message.reply({ embeds: [pages[pageNum]] });
    }
  }
}
