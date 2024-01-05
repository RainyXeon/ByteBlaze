import { EmbedBuilder } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";

export default class implements Command {
  public name = ["ping"];
  public description = "Shows the ping information of the Bot";
  public category = "Info";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = false;
  public options = [];
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const ping = new EmbedBuilder()
      .setTitle(
        `${client.i18n.get(handler.language, "info", "ping_title")}` +
          client.user!.username
      )
      .setDescription(
        `${client.i18n.get(handler.language, "info", "ping_desc", {
          ping: String(client.ws.ping),
        })}`
      )
      .setTimestamp()
      .setColor(client.color);

    await handler.editReply({ embeds: [ping] });
  }
}
