import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["reset"];
  public description = "Reset filter";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["reset"];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;

  async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(handler.guild!.id);

    if (!player?.data.get("filter-mode"))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "filters", "reset_already")}`
            )
            .setColor(client.color),
        ],
      });

    player?.data.delete("filter-mode");

    const data = {
      guildId: handler.guild!.id,
      playerOptions: {
        filters: {},
      },
    };

    await player?.send(data);
    await player?.setVolume(100);

    const resetted = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "reset_on")}`
      )
      .setColor(client.color);

    await delay(2000);
    await handler.editReply({ content: " ", embeds: [resetted] });
  }
}
