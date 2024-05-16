import { EmbedBuilder, GuildBasedChannel, PermissionFlagsBits, TextChannel } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["announcement"];
  public description = "Send announcement mesage to all server";
  public category = "Owner";
  public accessableby = [Accessableby.Admin];
  public usage = "<your_message>";
  public aliases = ["an"];
  public lavalink = false;
  public usingInteraction = false;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public permissions = [];
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    if (!handler.args[0] || !handler.message)
      return handler.editReply({
        embeds: [new EmbedBuilder().setColor(client.color).setDescription("`⚠️` | Empty args!")],
      });

    const avalibleChannel: GuildBasedChannel[] = [];
    const allGuild = client.guilds.cache.map((guild) => guild);
    let sentSuccesfully = 0;

    for (const guild of allGuild) {
      const channelFilterTextBased = guild.channels.cache.filter((channel) => channel.isTextBased());
      const channelFilterPermission = channelFilterTextBased.filter((channel) =>
        channel.guild.members.me?.permissions.has(PermissionFlagsBits.SendMessages)
      );
      const channelFilterGeneral = channelFilterPermission.filter((channel) => channel.name.includes("general"));
      const channelFilterNonGeneral = channelFilterPermission.filter((channel) => !channel.name.includes("general"));
      if (channelFilterGeneral.size !== 0) {
        avalibleChannel.push(channelFilterGeneral.first()!);
      } else {
        avalibleChannel.push(channelFilterNonGeneral.first()!);
      }
    }

    const parsed = handler.message.content.replace(handler.prefix, "").split(" ");
    const block = this.parse(parsed.slice(1).join(" "));

    for (const channel of avalibleChannel) {
      sentSuccesfully = sentSuccesfully + 1;
      const announcement = new EmbedBuilder()
        .setAuthor({ name: "💫 | Announcement" })
        .setDescription(block !== null ? block[2] : parsed.slice(1).join(" ")!)
        .setColor(client.color)
        .setFooter({
          text: `${handler.guild!.members.me!.displayName}`,
          iconURL: client.user!.displayAvatarURL(),
        });

      try {
        (channel as TextChannel).send({ embeds: [announcement] });
      } catch (err) {
        sentSuccesfully = sentSuccesfully - 1;
      }
    }

    const result = new EmbedBuilder()
      .setDescription(
        `\`🟢\` | **Sent successfully in ${sentSuccesfully}**\n\`🔴\` | **Sent failed in ${
          avalibleChannel.length - sentSuccesfully
        }**`
      )
      .setColor(client.color)
      .setFooter({
        text: `${handler.guild!.members.me!.displayName}`,
        iconURL: client.user!.displayAvatarURL(),
      });

    await handler.editReply({ embeds: [result] });
  }

  protected parse(content: string): string[] | null {
    const result = content.match(/^```(.*?)\n(.*?)```$/ms);
    return result ? result.slice(0, 3).map((el) => el.trim()) : null;
  }
}
