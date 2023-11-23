import { EmbedBuilder, Message } from "discord.js";
import { PrefixCommand } from "../../../@types/Command.js";
import { Manager } from "../../../manager.js";

export default class implements PrefixCommand {
  public name = "restart"
  public description = "Shuts down the client!"
  public category = "Admin"
  public accessableby = "Owner"
  public usage = ""
  public aliases = []
  public owner = true
  public premium = false
  public lavalink = false
  public isManager = false

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const restart = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "utilities", "restart_msg")}`
      )
      .setColor(client.color)
      .setFooter({
        text: `© ${message.guild!.members.me!.displayName}`,
        iconURL: client.user!.displayAvatarURL(),
      });

    await message.reply({ embeds: [restart] });

    process.exit();
  }
}