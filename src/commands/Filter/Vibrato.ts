import { EmbedBuilder } from "discord.js";
import delay from "delay";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["filter", "vibrato"];
  public description = "Turning on vibrato filter";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["vibrato"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(handler.guild!.id);

    const data = {
      guildId: handler.guild!.id,
      playerOptions: {
        vibrato: {
          frequency: 4.0,
          depth: 0.75,
        },
        filters: {
          vibrato: {
            frequency: 4.0,
            depth: 0.75,
          },
        },
      },
    };

    await player?.send(data);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "filter_on", {
          name: "Vibrato",
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    await handler.editReply({ content: " ", embeds: [embed] });
  }
}
