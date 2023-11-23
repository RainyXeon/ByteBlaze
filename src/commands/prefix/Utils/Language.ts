import { Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder } from "discord.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand{
  name = "language"
  aliases = ["setlang", "lang"]
  usage = "<language>"
  accessableby = Accessableby.Manager;
  category = "Utils"
  description = "Change the language for the bot"
  owner = false
  premium = false
  lavalink = false
  isManager = true

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const languages = client.i18n.getLocales();
    if (!args[0])
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "provide_lang", {
                languages: languages.join(", "),
              })}`
            )
            .setColor(client.color),
        ],
      });
    if (!languages.includes(args[0]))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "provide_lang", {
                languages: languages.join(", "),
              })}`
            )
            .setColor(client.color),
        ],
      });

    const newLang = await client.db.language.get(`${message.guild!.id}`);
    if (!newLang) {
      await client.db.language.set(`${message.guild!.id}`, args[0]);
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_set", {
            language: args[0],
          })}`
        )
        .setColor(client.color);

      return message.reply({ embeds: [embed] });
    } else if (newLang) {
      await client.db.language.set(`${message.guild!.id}`, args[0]);
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_change", {
            language: args[0],
          })}`
        )
        .setColor(client.color);

      return message.reply({ embeds: [embed] });
    }
  }
};
