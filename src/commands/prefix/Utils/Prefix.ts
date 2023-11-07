import { Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "prefix",
  aliases: ["setprefix"],
  usage: "<input>",
  category: "Utils",
  description: "Change the prefix for the bot",
  owner: false,
  premium: false,
  lavalink: false,
  isManager: true,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    if (!args[0])
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "prefix_arg")}`
            )
            .setColor(client.color),
        ],
      });
    if (args[0].length > 10)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "prefix_length")}`
            )
            .setColor(client.color),
        ],
      });

    const newPrefix = await client.db.prefix.get(`${message.guild!.id}`);

    if (!newPrefix) {
      await client.db.prefix.set(`${message.guild!.id}`, args[0]);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "prefix_set", {
            prefix: args[0],
          })}`
        )
        .setColor(client.color);

      return message.reply({ embeds: [embed] });
    } else if (newPrefix) {
      await client.db.prefix.set(`${message.guild!.id}`, args[0]);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "prefix_change", {
            prefix: args[0],
          })}`
        )
        .setColor(client.color);

      return message.reply({ embeds: [embed] });
    }
  },
};
