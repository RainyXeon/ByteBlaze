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
      .setLabel(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_name_label"
        )}`
      )
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_name_placeholder"
        )}`
      )
      .setCustomId("pl_name")
      .setRequired(true);
    const playlistDes = new TextInputBuilder()
      .setLabel(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_des_label"
        )}`
      )
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_des_placeholder"
        )}`
      )
      .setCustomId("pl_des")
      .setRequired(true);
    const playlistPrivate = new TextInputBuilder()
      .setLabel(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_private_label"
        )}`
      )
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_private_placeholder"
        )}`
      )
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
            .setDescription(
              `${client.i18n.get(
                language,
                "playlist",
                "ineraction_edit_playlist_error"
              )}`
            )
            .setColor(client.color),
        ],
      });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");
    // Send Message
    const msg = await collector.reply({
      embeds: [
        new EmbedBuilder().setDescription(
          `${client.i18n.get(language, "playlist", "ineraction_edit_loading")}`
        ),
      ],
    });

    const playlist = await client.db.playlist.get(value!);

    if (!playlist)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                language,
                "playlist",
                "ineraction_edit_notfound"
              )}`
            )
            .setColor(client.color),
        ],
      });

    if (playlist.owner !== interaction.user.id)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                language,
                "playlist",
                "ineraction_edit_playlist_owner"
              )}`
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

    await msg.edit({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(
              language,
              "playlist",
              "ineraction_edit_success"
            )}`
          )
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
