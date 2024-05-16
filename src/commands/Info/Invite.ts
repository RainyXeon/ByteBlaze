import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";

export default class implements Command {
  public name = ["invite"];
  public description = "Shows the invite information of the Bot";
  public category = "Info";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = [];
  public lavalink = false;
  public options = [];
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const invite = new EmbedBuilder()
      .setTitle(
        `${client.getString(handler.language, "command.info", "inv_title", {
          username: client.user!.username,
        })}`
      )
      .setDescription(
        `${client.getString(handler.language, "command.info", "inv_desc", {
          username: client.user!.username,
        })}`
      )
      .addFields([
        {
          name: "ByteBlaze",
          value: "https://github.com/RainyXeon/ByteBlaze",
          inline: false,
        },
      ])
      .setTimestamp()
      .setColor(client.color);

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Me")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${
            client.user!.id
          }&permissions=8&scope=bot%20applications.commands`
        )
    );

    await handler.editReply({ embeds: [invite], components: [row2] });
  }
}
