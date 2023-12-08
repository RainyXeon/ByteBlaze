import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["playlist", "delete"];
  description = "Delete a playlist";
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

    const playlist = await client.db.playlist.get(`${value}`);

    if (!playlist)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "delete_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== interaction.user.id)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "delete_owner")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.id == "thedreamvastghost0923849084") return;

    const action = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId("yes")
        .setLabel("Yes"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("no")
        .setLabel("No")
    ])

    const msg = await interaction.editReply({ embeds: [
      new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "playlist", "delete_confirm", {
          playlist_id: String(value)
        })}`)
    ], components: [
      action
    ] })

    const collector = msg.createMessageComponentCollector({ filter: (m) => m.user.id == interaction.user.id, time: 20000 })

    collector.on("collect", async (message) => {
      const id = message.customId;
      if (id == "yes") {
        await client.db.playlist.delete(String(value));
        const embed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "delete_deleted", {
              name: String(value),
            })}`
          )
          .setColor(client.color);
          message.reply({ embeds: [embed] });
      } else if (id == "no") {
        const embed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "delete_no")}`
          )
          .setColor(client.color);
          message.reply({ embeds: [embed] });
      }
    })

    collector.on("end", async () => {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "delete_no")}`
        )
        .setColor(client.color);
      await msg.edit({ embeds: [embed], components: [] });
    })
  }
}
