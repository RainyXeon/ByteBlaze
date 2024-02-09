import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["soft"];
  public description = "Turning on soft filter";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["soft"];
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
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0 },
            { band: 8, gain: -0.25 },
            { band: 9, gain: -0.25 },
            { band: 10, gain: -0.25 },
            { band: 11, gain: -0.25 },
            { band: 12, gain: -0.25 },
            { band: 13, gain: -0.25 },
          ],
        },
      },
    };

    await player?.send(data);

    const softed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "filter_on", {
          name: this.name[0],
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    await handler.editReply({ content: " ", embeds: [softed] });
  }
}
