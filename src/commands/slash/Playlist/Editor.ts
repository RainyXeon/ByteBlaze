import {
  CommandInteraction,
  TextInputBuilder,
  CommandInteractionOptionResolver,
  ApplicationCommandOptionType,
  TextInputStyle,
  ModalBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} from "discord.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import { Manager } from "../../../manager.js";

export default class implements SlashCommand {
  name = ["playlist", "editor"];
  description = "Edit playlist info for public";
  accessableby = Accessableby.Member;
  category = "Playlist";
  options = [
    {
      name: "id",
      description: "The id of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];
  lavalink = false;

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    const playlistName = new TextInputBuilder()
      .setLabel("New playlist name?")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter your playlist name!")
      .setCustomId("pl_name")
      .setRequired(true);
    const playlistDes = new TextInputBuilder()
      .setLabel("New playlist description?")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter your playlist description!")
      .setCustomId("pl_des")
      .setRequired(true);
    const playlistPrivate = new TextInputBuilder()
      .setLabel("View mode? [TRUE OR FALSE only]")
      .setStyle(TextInputStyle.Short)
      .setCustomId("pl_mode")
      .setRequired(true);

    const modal = new ModalBuilder()
      .setCustomId("play_extra")
      .setTitle("Playlist editor")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(playlistName),
        new ActionRowBuilder<TextInputBuilder>().addComponents(playlistDes),
        new ActionRowBuilder<TextInputBuilder>().addComponents(playlistPrivate)
      );

    await interaction.showModal(modal);

    const collector = await interaction
      .awaitModalSubmit({
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id,
      })
      .catch((error) => {
        console.error(error);
        return null;
      });

    if (!collector)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Something went wrong with modal, please try again")
            .setColor(client.color),
        ],
      });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");
    // Send Message
    await collector.reply("`Success Submit...`");

    const playlist = await client.db.playlist.get(value!);

    if (!playlist)
      return interaction.channel?.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "delete_notfound")}`
            )
            .setColor(client.color),
        ],
      });

    await client.db.playlist.set(
      `${value}.name`,
      collector.fields.getTextInputValue("pl_name")
    );
    await client.db.playlist.set(
      `${value}.description`,
      collector.fields.getTextInputValue("pl_des")
    );
    await client.db.playlist.set(
      `${value}.private`,
      this.parseBoolean(collector.fields.getTextInputValue("pl_mode"))
    );

    await interaction.channel?.send({
      embeds: [
        new EmbedBuilder()
          .setDescription("Edited succesfully!")
          .setColor(client.color),
      ],
    });
  }

  private parseBoolean(value: string) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case "true":
        return true;
      case "null":
        return "null";
      case "undefined":
        return undefined;
      default:
        return false;
    }
  }
}
