import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["filter", "nightcore"];
  public description = "Turning on nightcore filter";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["nightcore"];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(handler.guild!.id);

    const data = {
      guildId: handler.guild!.id,
      playerOptions: {
        filters: {
          timescale: {
            speed: 1.05,
            pitch: 1.125,
            rate: 1.05,
          },
        },
      },
    };

    await player?.send(data);

    const nightcored = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "filter_on", {
          name: "Nightcore",
        })}`
      )
      .setColor(client.color);

    await handler.editReply({ content: " ", embeds: [nightcored] });
  }
}
