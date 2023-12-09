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
import { Playlist } from "../../../database/schema/Playlist.js";

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
    const playlistId = new TextInputBuilder()
      .setLabel(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_id_label"
        )}`
      )
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(
        `${client.i18n.get(
          language,
          "playlist",
          "ineraction_edit_playlist_id_placeholder"
        )}`
      )
      .setCustomId("pl_id")
      .setRequired(false);

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
      .setRequired(false);
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
      .setRequired(false);
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
      .setRequired(false);

    const modal = new ModalBuilder()
      .setCustomId("play_extra")
      .setTitle("Playlist editor")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(playlistId),
        new ActionRowBuilder<TextInputBuilder>().addComponents(playlistName),
        new ActionRowBuilder<TextInputBuilder>().addComponents(playlistDes),
        new ActionRowBuilder<TextInputBuilder>().addComponents(playlistPrivate)
      );

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");

    const playlist = await client.db.playlist.get(value!);

    if (!playlist)
      return interaction.reply({
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
      return interaction.reply({
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

    // Send Message
    await collector.deferReply();

    const msg = await collector.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(
              language,
              "playlist",
              "ineraction_edit_loading"
            )}`
          )
          .setColor(client.color),
      ],
    });

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
    const idCol = collector.fields.getTextInputValue("pl_id");
    const nameCol = collector.fields.getTextInputValue("pl_name");
    const desCol = collector.fields.getTextInputValue("pl_des");
    const modeCol = collector.fields.getTextInputValue("pl_mode");

    const newId = idCol.length !== 0 ? idCol : playlist.id;
    const newName = nameCol.length !== 0 ? nameCol : playlist.name;
    const newDes = desCol.length !== 0 ? desCol : playlist.description;
    const newMode =
      modeCol.length !== 0 ? this.parseBoolean(modeCol) : playlist.private;

    if (newId) {
      if (!this.vaildId(newId))
        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(
                  language,
                  "playlist",
                  "ineraction_edit_invalid_id"
                )}`
              )
              .setColor(client.color),
          ],
        });

      await client.db.playlist.set(newId, {
        id: newId,
        name: newName,
        description: newDes,
        owner: playlist.owner,
        tracks: playlist.tracks,
        private: newMode,
        created: playlist.created,
      });

      await msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                language,
                "playlist",
                "ineraction_edit_success",
                {
                  playlistId: newId,
                }
              )}`
            )
            .setColor(client.color),
        ],
      });

      if (playlist.id !== newId) await client.db.playlist.delete(playlist.id);
      return;
    }

    await client.db.playlist.set(`${value}.name`, newName);
    await client.db.playlist.set(`${value}.description`, newDes);
    await client.db.playlist.set(`${value}.private`, newMode);

    await msg.edit({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(
              language,
              "playlist",
              "ineraction_edit_success",
              {
                playlistId: newId,
              }
            )}`
          )
          .setColor(client.color),
      ],
    });
  }

  private vaildId(id: string) {
    return /^[\w&.-]+$/.test(id);
  }

  private parseBoolean(value: string) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case "public":
        return true;
      case "private":
        return false;
      default:
        return false;
    }
  }
}
