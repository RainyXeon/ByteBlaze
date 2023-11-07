import {
  EmbedBuilder,
  CommandInteractionOptionResolver,
  ApplicationCommandOptionType,
  CommandInteraction,
} from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { SlashPage } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";
import { Playlist, PlaylistTrack } from "../../../database/schema/Playlist.js";

export default {
  name: ["playlist", "detail"],
  description: "Detail a playlist",
  category: "Playlist",
  owner: false,
  premium: false,
  lavalink: false,
  isManager: false,
  options: [
    {
      name: "name",
      description: "The name of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "page",
      description: "The page you want to view",
      required: false,
      type: ApplicationCommandOptionType.Integer,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("name");
    const number = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("page");

    const Plist = value!.replace(/_/g, " ");

    const fullList = await client.db.playlist.all();

    const pid = fullList.filter(function (data) {
      return (
        data.value.owner == interaction.user.id && data.value.name == Plist
      );
    });

    const playlist = pid[0].value;

    if (!playlist)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "detail_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.private && playlist.owner !== interaction.user.id)
      return interaction.editReply({
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
          duration: formatDuration(playlists.length),
        })}
                `
      );
    }

    const totalDuration = formatDuration(
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
          iconURL: interaction.user.displayAvatarURL(),
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
        SlashPage(
          client,
          interaction,
          pages,
          60000,
          playlist.tracks!.length,
          Number(totalDuration),
          language
        );
      else return interaction.editReply({ embeds: [pages[0]] });
    } else {
      if (isNaN(number))
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "playlist", "detail_notnumber")}`
              )
              .setColor(client.color),
          ],
        });
      if (number > pagesNum)
        return interaction.editReply({
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
      const pageNum = number == 0 ? 1 : number - 1;
      return interaction.editReply({ embeds: [pages[pageNum]] });
    }
  },
};
