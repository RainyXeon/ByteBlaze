import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
  CommandInteraction,
  ActionRowBuilder,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

let count = 0;
let answer: string[] = [];

export default class implements Command {
  public name = ["pl", "editor"];
  public description = "Edit playlist info for public";
  public category = "Playlist";
  public accessableby = [Accessableby.Member];
  public usage = "<playlist_id>";
  public aliases = [];
  public lavalink = true;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "id",
      description: "The id of the playlist",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    if (handler.message) {
      await this.prefixMode(client, handler.message, handler.args, handler.language, handler.prefix);
    } else if (handler.interaction) {
      await this.interactionMode(client, handler.interaction, handler.language);
    } else return;
  }

  // Prefix mode
  private async prefixMode(client: Manager, message: Message, args: string[], language: string, prefix: string) {
    const value = args[0] ? args[0] : null;
    if (value == null)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "command.playlist", "edit_arg")}`)
            .setColor(client.color),
        ],
      });

    const playlist = await client.db.playlist.get(value);

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "command.playlist", "edit_notfound")}`)
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "command.playlist", "edit_playlist_owner")}`)
            .setColor(client.color),
        ],
      });

    const questions = this.questionString(client, language);

    for (let i = 0; i < questions.length; i++) {
      const send = await message.reply(questions[i].question);
      const res = await send.channel.awaitMessages({
        filter: (m) => m.author.id === message.author.id,
        time: 5 * 6000,
        max: 1,
      });
      const msg = await res.first()!.content;
      if (msg !== undefined || null) count++;
      answer.push(msg);
      if (count == questions.length) {
        const idCol = answer[0];
        const nameCol = answer[1];
        const desCol = answer[2];
        const modeCol = answer[3];

        const newId = idCol.length !== 0 ? idCol : null;
        const newName = nameCol.length !== 0 ? nameCol : playlist.name;
        const newDes = desCol.length !== 0 ? desCol : playlist.description ? playlist.description : "null";
        const newMode = modeCol.length !== 0 ? modeCol : playlist.private;

        if (newId) {
          if (!this.vaildId(newId)) {
            message.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_id")}`)
                  .setColor(client.color),
              ],
            });

            count = 0;
            answer.length = 0;
            return;
          }

          const isAlreadyId = await client.db.playlist.get(newId);

          if (isAlreadyId)
            return message.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_invalid_id")}`)
                  .setColor(client.color),
              ],
            });

          if (this.validMode(String(newMode)) == null) {
            message.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
                  .setColor(client.color),
              ],
            });

            count = 0;
            answer.length = 0;
            return;
          }

          await client.db.playlist.set(newId, {
            id: newId,
            name: newName,
            description: newDes,
            owner: playlist.owner,
            tracks: playlist.tracks,
            private: newMode,
            created: playlist.created,
          });

          await message.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `${client.getString(language, "command.playlist", "edit_success", {
                    playlistId: newId,
                  })}`
                )
                .setColor(client.color),
            ],
          });
          if (playlist.id !== newId) await client.db.playlist.delete(playlist.id);
          count = 0;
          answer.length = 0;
          return;
        }

        if (this.validMode(String(newMode)) == null) {
          message.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
                .setColor(client.color),
            ],
          });

          count = 0;
          answer.length = 0;
          return;
        }

        await client.db.playlist.set(`${value}.name`, newName);
        await client.db.playlist.set(`${value}.description`, newDes);
        await client.db.playlist.set(`${value}.private`, newMode);

        const embed = new EmbedBuilder()
          .setDescription(
            `${client.getString(language, "command.playlist", "edit_success", {
              playlistId: playlist.id,
            })}`
          )
          .setColor(client.color);
        message.reply({ embeds: [embed] });

        count = 0;
        answer.length = 0;
      }
    }
  }

  private questionString(client: Manager, language: string) {
    return [
      {
        question: `${client.getString(language, "command.playlist", "edit_playlist_id_label")}`,
      },
      {
        question: `${client.getString(language, "command.playlist", "edit_playlist_name_label")}`,
      },
      {
        question: `${client.getString(language, "command.playlist", "edit_playlist_des_label")}`,
      },
      {
        question: `${client.getString(language, "command.playlist", "edit_playlist_private_label")}`,
      },
    ];
  }

  private vaildId(id: string) {
    return /^[\w&.-]+$/.test(id);
  }

  private validMode(value: string) {
    if (typeof value === "string") {
      value = value.trim().toLowerCase();
    }
    switch (value) {
      case "public":
        return true;
      case "private":
        return false;
      case "true":
        return true;
      case "false":
        return false;
      default:
        return null;
    }
  }

  // Interaction mode
  private async interactionMode(client: Manager, interaction: CommandInteraction, language: string) {
    const playlistId = new TextInputBuilder()
      .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_id_label")}`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_id_placeholder")}`)
      .setCustomId("pl_id")
      .setRequired(false);

    const playlistName = new TextInputBuilder()
      .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_name_label")}`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_name_placeholder")}`)
      .setCustomId("pl_name")
      .setRequired(false);
    const playlistDes = new TextInputBuilder()
      .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_des_label")}`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_des_placeholder")}`)
      .setCustomId("pl_des")
      .setRequired(false);
    const playlistPrivate = new TextInputBuilder()
      .setLabel(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_private_label")}`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(
        `${client.getString(language, "command.playlist", "ineraction_edit_playlist_private_placeholder")}`
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

    const value = (interaction.options as CommandInteractionOptionResolver).getString("id");

    const playlist = await client.db.playlist.get(value!);

    if (!playlist)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_notfound")}`)
            .setColor(client.color),
        ],
      });

    if (playlist.owner !== interaction.user.id)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_owner")}`)
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
            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_playlist_error")}`)
            .setColor(client.color),
        ],
      });

    // Send Message
    await collector.deferReply();

    if (!playlist)
      return collector.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_notfound")}`)
            .setColor(client.color),
        ],
      });
    const idCol = collector.fields.getTextInputValue("pl_id");
    const nameCol = collector.fields.getTextInputValue("pl_name");
    const desCol = collector.fields.getTextInputValue("pl_des");
    const modeCol = collector.fields.getTextInputValue("pl_mode");

    const newId = idCol.length !== 0 ? idCol : null;
    const newName = nameCol.length !== 0 ? nameCol : playlist.name;
    const newDes = desCol.length !== 0 ? desCol : playlist.description ? playlist.description : "null";
    const newMode = modeCol.length !== 0 ? modeCol : playlist.private;

    if (newId) {
      if (!this.vaildId(newId))
        return collector.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_invalid_id")}`)
              .setColor(client.color),
          ],
        });

      const isAlreadyId = await client.db.playlist.get(newId);

      if (isAlreadyId)
        return collector.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(language, "command.playlist", "ineraction_edit_invalid_id")}`)
              .setColor(client.color),
          ],
        });

      if (this.validMode(String(newMode)) == null)
        return collector.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
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

      await collector.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.getString(language, "command.playlist", "ineraction_edit_success", {
                playlistId: newId,
              })}`
            )
            .setColor(client.color),
        ],
      });

      if (playlist.id !== newId) await client.db.playlist.delete(playlist.id);
      return;
    }

    if (this.validMode(String(newMode)) == null)
      return collector.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(language, "command.playlist", "edit_invalid_mode")}`)
            .setColor(client.color),
        ],
      });

    await client.db.playlist.set(`${value}.name`, newName);
    await client.db.playlist.set(`${value}.description`, newDes);
    await client.db.playlist.set(`${value}.private`, newMode);

    await collector.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.getString(language, "command.playlist", "ineraction_edit_success", {
              playlistId: playlist.id,
            })}`
          )
          .setColor(client.color),
      ],
    });
  }
}
