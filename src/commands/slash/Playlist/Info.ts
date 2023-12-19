import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import humanizeDuration from "humanize-duration";
import { Manager } from "../../../manager.js";
import { Playlist } from "../../../database/schema/Playlist.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["playlist", "info"];
  description = "Check the playlist infomation";
  category = "Playlist";
  accessableby = Accessableby.Member;
  lavalink = false;
  options = [
    {
      name: "id",
      description: "The id of the playlist",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];
  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const id = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");

    let info = await client.db.playlist.get(`${id}`);
    if (!info)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const created = humanizeDuration(Date.now() - info.created, { largest: 1 });

    const name = await client.users.fetch(info.owner);

    const embed = new EmbedBuilder()
      .setTitle(info.name)
      .addFields([
        {
          name: `${client.i18n.get(language, "playlist", "info_des")}`,
          value: `${
            info.description === null || info.description === "null"
              ? client.i18n.get(language, "playlist", "no_des")
              : info.description
          }`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_owner")}`,
          value: `${name.username}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_id")}`,
          value: `${info.id}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_total")}`,
          value: `${info.tracks!.length}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_created")}`,
          value: `${created}`,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_private")}`,
          value: `${
            info.private
              ? client.i18n.get(language, "playlist", "public")
              : client.i18n.get(language, "playlist", "private")
          }`,
        },
      ])
      .setColor(client.color);
    await interaction.editReply({ embeds: [embed] });

    info = null;
  }
}
