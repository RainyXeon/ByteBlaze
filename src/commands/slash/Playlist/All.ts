import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { SlashPlaylist } from "../../../structures/PageQueue.js";
import humanizeDuration from "humanize-duration";
import { Manager } from "../../../manager.js";
import { PlaylistInterface } from "../../../types/Playlist.js";

export default {
  name: ["playlist", "all"],
  description: "View all your playlists",
  category: "Playlist",
  owner: false,
  premium: false,
  lavalink: false,
  isManager: false,
  options: [
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
    const number = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("page");
    const playlists: PlaylistInterface[] = [];

    const fullList = await client.db.get("playlist");

    Object.keys(fullList)
      .filter(function (key) {
        return fullList[key].owner == interaction.user.id;
      })
      .forEach(async (key, index) => {
        playlists.push(fullList[key]);
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
        `${client.i18n.get(language, "playlist", "view_embed_playlist", {
          num: String(i + 1),
          name: playlist.name,
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
          name: `${client.i18n.get(language, "playlist", "view_embed_title", {
            user: interaction.user.username,
          })}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
        .setColor(client.color)
        .setFooter({
          text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            songs: String(playlists.length),
          })}`,
        });

      pages.push(embed);
    }
    if (!number) {
      if (pages.length == pagesNum && playlists.length > 10) {
        SlashPlaylist(
          client,
          interaction,
          pages,
          30000,
          playlists.length,
          language
        );
        return (playlists.length = 0);
      } else {
        await interaction.editReply({ embeds: [pages[0]] });
        return (playlists.length = 0);
      }
    } else {
      if (isNaN(number))
        return interaction.editReply({
          content: `${client.i18n.get(language, "playlist", "view_notnumber")}`,
        });
      if (number > pagesNum)
        return interaction.editReply({
          content: `${client.i18n.get(
            language,
            "playlist",
            "view_page_notfound",
            {
              page: String(pagesNum),
            }
          )}`,
        });
      const pageNum = number == 0 ? 1 : number - 1;
      await interaction.editReply({ embeds: [pages[pageNum]] });
      return (playlists.length = 0);
    }
  },
};
