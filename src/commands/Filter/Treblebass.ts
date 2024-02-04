import { Manager } from "../../manager.js";
import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["treblebass"];
  public description = "Turning on treblebass filter";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["treblebass"];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(handler.guild!.id);

    if (player?.data.get("filter-mode") == this.name[0])
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "filters",
                "filter_already",
                {
                  name: this.name[0],
                }
              )}`
            )
            .setColor(client.color),
        ],
      });

    player?.data.set("filter-mode", this.name[0]);

    const data = {
      guildId: handler.guild!.id,
      playerOptions: {
        filters: {
          equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 },
            { band: 7, gain: 0.23 },
            { band: 8, gain: 0.35 },
            { band: 9, gain: 0.45 },
            { band: 10, gain: 0.55 },
            { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 },
            { band: 13, gain: 0 },
          ],
        },
      },
    };

    await player?.send(data);

    const tbed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "filter_on", {
          name: this.name[0],
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    await handler.editReply({ content: " ", embeds: [tbed] });
  }
}
