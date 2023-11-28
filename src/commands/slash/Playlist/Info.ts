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

let info: Playlist | null;

export default class implements SlashCommand {
  name = ["playlist", "info"];
  description = "Check the playlist infomation";
  category = "Playlist";
  accessableby = Accessableby.Member;
  lavalink = false;
  options = [
    {
      name: "name",
      description: "The name of the playlist",
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "id",
      description: "The id of the playlist",
      type: ApplicationCommandOptionType.String,
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
    ).getString("name");
    const id = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");

    if (id) info = await client.db.playlist.get(`${id}`);
    if (value) {
      const Plist = value.replace(/_/g, " ");

      const fullList = await client.db.playlist.all();

      const pid = fullList.filter(function (data) {
        return (
          data.value.owner == interaction.user.id && data.value.name == Plist
        );
      });

      info = pid[0].value;
    }

    if (!id && !value)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "no_id_or_name")}`
            )
            .setColor(client.color),
        ],
      });
    if (id && value)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "got_id_and_name")}`
            )
            .setColor(client.color),
        ],
      });
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

    if (info.private && info.owner !== interaction.user.id) {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "import_private")}`
            )
            .setColor(client.color),
        ],
      });
      return;
    }
    const created = humanizeDuration(Date.now() - info.created, { largest: 1 });

    const name = await client.users.fetch(info.owner);

    const embed = new EmbedBuilder()
      .setTitle(
        `${client.i18n.get(language, "playlist", "info_title", {
          name: info.name,
        })}`
      )
      .addFields([
        {
          name: `${client.i18n.get(language, "playlist", "info_name")}`,
          value: `${info.name}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_id")}`,
          value: `${info.id}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_total")}`,
          value: `${info.tracks!.length}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_created")}`,
          value: `${created}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_private")}`,
          value: `${
            info.private
              ? client.i18n.get(language, "playlist", "enabled")
              : client.i18n.get(language, "playlist", "disabled")
          }`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_owner")}`,
          value: `${name.username}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "playlist", "info_des")}`,
          value: `${
            info.description === null
              ? client.i18n.get(language, "playlist", "no_des")
              : info.description
          }`,
        },
      ])
      .setColor(client.color);
    await interaction.editReply({ embeds: [embed] });

    info = null;
  }
}
