import { Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "prefix",
  aliases: ["setprefix"],
  usage: "<input>",
  category: "Utils",
  description: "Change the prefix for the bot",
  accessableby: "Members",
  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    if (!message.member!.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return message.channel.send(
        `${client.i18n.get(language, "utilities", "prefix_perm")}`
      );
    if (!args[0])
      return message.channel.send(
        `${client.i18n.get(language, "utilities", "prefix_arg")}`
      );
    if (args[0].length > 10)
      return message.channel.send(
        `${client.i18n.get(language, "utilities", "prefix_length")}`
      );

    const newPrefix = await client.db.get(`prefix.guild_${message.guild!.id}`);

    if (!newPrefix) {
      await client.db.set(`prefix.guild_${message.guild!.id}`, args[0]);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "prefix_set", {
            prefix: args[0],
          })}`
        )
        .setColor(client.color);

      return message.channel.send({ embeds: [embed] });
    } else if (newPrefix) {
      await client.db.set(`prefix.guild_${message.guild!.id}`, args[0]);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "prefix_change", {
            prefix: args[0],
          })}`
        )
        .setColor(client.color);

      return message.channel.send({ embeds: [embed] });
    }
  },
};
