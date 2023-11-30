import { ButtonStyle, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "ping";
  description = "Shows the ping information of the Bot";
  category = "Info";
  accessableby = Accessableby.Member;
  usage = "";
  aliases = [];
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const ping = new EmbedBuilder()
      .setTitle(
        `${client.i18n.get(language, "info", "ping_title")}` +
          client.user!.username
      )
      .setDescription(
        `${client.i18n.get(language, "info", "ping_desc", {
          ping: String(client.ws.ping),
        })}`
      )
      .setTimestamp()
      .setColor(client.color);
    const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Me")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${
            client.user!.id
          }&permissions=8&scope=bot%20applications.commands`
        )
    );

    await message.reply({ embeds: [ping], components: [row3] });
  }
}
