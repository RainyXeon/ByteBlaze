import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  version,
  CommandInteraction,
  ButtonStyle,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["info", "ping"];
  description = "Shows the ping information of the Bot";
  category = "Info";
  options = [];
  lavalink = false;
  accessableby = Accessableby.Member;

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
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

    await interaction.editReply({ embeds: [ping], components: [row3] });
  }
}
