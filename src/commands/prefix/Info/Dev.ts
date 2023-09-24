import { ButtonStyle, Message } from "discord.js"
import { Manager } from "../../../manager.js"
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js"

export default {
  name: "developer",
  description: "Shows the developer information of the Bot (Credit)",
  category: "Info",
  usage: "",
  aliases: ["dev"],
  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const xeondex = new EmbedBuilder()
      .setTitle(`${client.i18n.get(language, "info", "dev_title")}`)
      .setDescription(`${client.i18n.get(language, "info", "dev_desc")}`)
      .setFooter({ text: `${client.i18n.get(language, "info", "dev_foot")}` })
      .setColor(client.color)

    const row1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Github (Adivise)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/Adivise")
      )
      .addComponents(
        new ButtonBuilder()
          .setLabel("Github (XeonDex)")
          .setStyle(ButtonStyle.Link)
          .setURL("https://github.com/XeonE52680v3")
      )
      .addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle(ButtonStyle.Link)
          .setURL("https://discord.com/invite/xHvsCMjnhU")
      )

    await message.reply({ embeds: [xeondex], components: [row1] })
  },
}
