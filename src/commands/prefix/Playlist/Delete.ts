import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "playlist-delete";
  description = "Delete a playlist";
  category = "Playlist";
  usage = "<playlist_id>";
  aliases = ["pl-delete"];
  lavalink = false;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = args[0] ? args[0] : null;
    if (value == null)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const playlist = await client.db.playlist.get(value);

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "delete_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "delete_owner")}`
            )
            .setColor(client.color),
        ],
      });

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

    const msg = await message.reply({ embeds: [
      new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "playlist", "delete_confirm", {
          playlist_id: value
        })}`)
    ], components: [
      action
    ] })

    const collector = msg.createMessageComponentCollector({ filter: (m) => m.user.id == message.author.id, time: 20000 })

    collector.on("collect", async (interaction) => {
      const id = interaction.customId;
      if (id == "yes") {
        await client.db.playlist.delete(value);
        const embed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "delete_deleted", {
              name: value,
            })}`
          )
          .setColor(client.color);
          interaction.reply({ embeds: [embed] });
      } else if (id == "no") {
        const embed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "playlist", "delete_no")}`
          )
          .setColor(client.color);
          interaction.reply({ embeds: [embed] });
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
