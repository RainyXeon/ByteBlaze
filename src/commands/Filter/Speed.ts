import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import delay from "delay";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["speed"];
  public description = "Sets the speed of the song.";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "<number>";
  public aliases = ["speed"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [
    {
      name: "amount",
      description: "The amount of speed to set the song to.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0];

    if (value && isNaN(+value))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });

    if (Number(value) < 0)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "filters",
                "filter_greater"
              )}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(value) > 10)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "filters", "filter_less")}`
            )
            .setColor(client.color),
        ],
      });

    const player = await client.manager.players.get(handler.guild!.id);

    const data = {
      guildId: handler.guild!.id,
      playerOptions: {
        filters: {
          timescale: { speed: Number(value) },
        },
      },
    };

    await player?.send(data);

    player?.data.set("filter-mode", this.name[0]);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "speed_on", {
          amount: value,
        })}`
      )
      .setColor(client.color);
    await delay(2000);
    await handler.editReply({ content: " ", embeds: [embed] });
  }
}
