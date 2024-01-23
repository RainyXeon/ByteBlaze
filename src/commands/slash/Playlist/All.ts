import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { PageQueue } from "../../../structures/PageQueue.js";
import humanizeDuration from "humanize-duration";
import { Manager } from "../../../manager.js";
import { Playlist } from "../../../database/schema/Playlist.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["playlist", "all"];
  description = "View all your playlists";
  category = "Playlist";
  lavalink = false;
  accessableby = Accessableby.Member;
  options = [
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
    const number = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("page");
    const playlists: Playlist[] = [];

    const fullList = await client.db.playlist.all();

    fullList
      .filter(function (data) {
        return data.value.owner == interaction.user.id;
      })
      .forEach(async (data) => {
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
        `${client.i18n.get(language, "playlist", "view_embed_playlist", {
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
        new PageQueue(
          client,
          pages,
          30000,
          playlists.length,
          language
        ).slashPlaylistPage(interaction);
        return (playlists.length = 0);
      } else {
        await interaction.editReply({ embeds: [pages[0]] });
        return (playlists.length = 0);
      }
    } else {
      if (isNaN(number))
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "playlist", "view_notnumber")}`
              )
              .setColor(client.color),
          ],
        });
      if (number > pagesNum)
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "playlist", "view_page_notfound", {
                  page: String(pagesNum),
                })}`
              )
              .setColor(client.color),
          ],
        });
      const pageNum = number == 0 ? 1 : number - 1;
      await interaction.editReply({ embeds: [pages[pageNum]] });
      return (playlists.length = 0);
    }
  }
}
