import { Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder } from "discord.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "prefix";
  aliases = ["setprefix"];
  usage = "<input>";
  accessableby = Accessableby.Manager;
  category = "Utils";
  description = "Change the prefix for the bot";
  owner = false;
  premium = false;
  lavalink = false;
  isManager = true;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
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
  }
}
