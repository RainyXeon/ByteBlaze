import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["shutdown"];
  public description = "Shuts down the client!";
  public category = "Owner";
  public accessableby = [Accessableby.Owner];
  public usage = "";
  public aliases = ["shutdown"];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const restart = new EmbedBuilder()
      .setDescription(`${client.getString(handler.language, "command.utils", "restart_msg")}`)
      .setColor(client.color)
      .setFooter({
        text: `${handler.guild!.members.me!.displayName}`,
        iconURL: client.user!.displayAvatarURL(),
      });

    await handler.editReply({ embeds: [restart] });

    process.exit();
  }
}
