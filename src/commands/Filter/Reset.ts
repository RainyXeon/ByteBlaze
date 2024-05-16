import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["reset"];
  public description = "Reset filter";
  public category = "Filter";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = ["reset"];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];

  async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id);

    if (!player?.data.get("filter-mode"))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.filter", "reset_already")}`)
            .setColor(client.color),
        ],
      });

    player?.data.delete("filter-mode");

    await player?.filter.clear();
    await player?.setVolume(100);

    const resetted = new EmbedBuilder()
      .setDescription(`${client.getString(handler.language, "command.filter", "reset_on")}`)
      .setColor(client.color);
    await handler.editReply({ content: " ", embeds: [resetted] });
  }
}
