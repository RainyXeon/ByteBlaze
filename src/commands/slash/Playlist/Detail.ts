import {
  EmbedBuilder,
  CommandInteractionOptionResolver,
  ApplicationCommandOptionType,
  CommandInteraction,
} from "discord.js";
import { FormatDuration } from "../../../structures/FormatDuration.js";
import { PageQueue } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";
import { Playlist, PlaylistTrack } from "../../../database/schema/Playlist.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["playlist", "detail"];
  description = "Detail a playlist";
  category = "Playlist";
  lavalink = false;
  accessableby = Accessableby.Member;
  options = [
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
  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");
    const number = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("page");

    const playlist = await client.db.playlist.get(value!);

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
        new PageQueue(
          client,
          pages,
          60000,
          playlist.tracks!.length,
          language
        ).slashPage(interaction, Number(totalDuration));
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
  }
}
