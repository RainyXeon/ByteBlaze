import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { NormalPage } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";
import { PlaylistTrackInterface } from "../../../types/Playlist.js";

export default {
  name: "playlist-detail",
  description: "Detail a playlist",
  category: "Playlist",
  usage: "<playlist_name> <number>",
  aliases: ["pl-detail"],
  owner: false,
  premium: false,
  lavalink: false,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
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

    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == message.author.id && fullList[key].name == Plist
      );
    });

    const playlist = fullList[pid[0]];

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

    let pagesNum = Math.ceil(playlist.tracks.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const playlistStrings = [];
    for (let i = 0; i < playlist.tracks.length; i++) {
      const playlists = playlist.tracks[i];
      playlistStrings.push(
        `${client.i18n.get(language, "playlist", "detail_track", {
          num: String(i + 1),
          title: playlists.title,
          url: playlists.uri,
          author: playlists.author,
          duration: formatDuration(playlists.length),
        })}
                `
      );
    }

    const totalDuration = formatDuration(
      playlist.tracks.reduce(
        (acc: number, cur: PlaylistTrackInterface) => acc + cur.length!,
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
              songs: playlist.tracks.length,
              duration: totalDuration,
            }
          )}`,
        });

      pages.push(embed);
    }
    if (!number) {
      if (pages.length == pagesNum && playlist.tracks.length > 10)
        NormalPage(
          client,
          message,
          pages,
          60000,
          playlist.tracks.length,
          Number(totalDuration),
          language
        );
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
  },
};
