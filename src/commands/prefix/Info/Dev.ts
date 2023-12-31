import { ButtonStyle, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "developer";
  description = "Shows the developer information of the Bot (Credit)";
  category = "Info";
  usage = "";
  aliases = ["dev"];
  accessableby = Accessableby.Member;
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const xeondex = new EmbedBuilder()
      .setTitle(`${client.i18n.get(language, "info", "dev_title")}`)
      .setDescription(`${client.i18n.get(language, "info", "dev_desc")}`)
      .setFooter({ text: `${client.i18n.get(language, "info", "dev_foot")}` })
      .setColor(client.color);

    const row1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Github (RainyXeon)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/RainyXeon")
      )
      .addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.gg/xff4e2WvVy")
      );

    await message.reply({ embeds: [xeondex], components: [row1] });
  }
}
