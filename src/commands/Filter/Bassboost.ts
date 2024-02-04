import { Manager } from "../../manager.js";
import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import delay from "delay";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["bassboost"];
  public description = "Turning on bassboost filter";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "<number>";
  public aliases = ["bassboost"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [
    {
      name: "amount",
      description: "The amount of the bassboost",
      type: ApplicationCommandOptionType.Number,
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
              `${client.i18n.get(handler.language, "filters", "filter_number")}`
            )
            .setColor(client.color),
        ],
      });

    const player = client.manager.players.get(handler.guild!.id);

    if (!value) {
      const data = {
        guildId: handler.guild!.id,
        playerOptions: {
          filters: {
            equalizer: [
              { band: 0, gain: 0.1 },
              { band: 1, gain: 0.1 },
              { band: 2, gain: 0.05 },
              { band: 3, gain: 0.05 },
              { band: 4, gain: -0.05 },
              { band: 5, gain: -0.05 },
              { band: 6, gain: 0 },
              { band: 7, gain: -0.05 },
              { band: 8, gain: -0.05 },
              { band: 9, gain: 0 },
              { band: 10, gain: 0.05 },
              { band: 11, gain: 0.05 },
              { band: 12, gain: 0.1 },
              { band: 13, gain: 0.1 },
            ],
          },
        },
      };

      await player?.send(data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "filters", "filter_on", {
            name: "Bassboost",
          })}`
        )
        .setColor(client.color);

      await delay(2000);
      return handler.editReply({ content: " ", embeds: [embed] });
    }

    if (Number(value) > 10 || Number(value) < -10)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "filters",
                "bassboost_limit"
              )}`
            )
            .setColor(client.color),
        ],
      });
    const data = {
      guildId: handler.guild!.id,
      playerOptions: {
        filters: {
          equalizer: [
            { band: 0, gain: Number(value) / 10 },
            { band: 1, gain: Number(value) / 10 },
            { band: 2, gain: Number(value) / 10 },
            { band: 3, gain: Number(value) / 10 },
            { band: 4, gain: Number(value) / 10 },
            { band: 5, gain: Number(value) / 10 },
            { band: 6, gain: Number(value) / 10 },
            { band: 7, gain: 0 },
            { band: 8, gain: 0 },
            { band: 9, gain: 0 },
            { band: 10, gain: 0 },
            { band: 11, gain: 0 },
            { band: 12, gain: 0 },
            { band: 13, gain: 0 },
          ],
        },
      },
    };
    await player?.send(data);

    player?.data.set("filter-mode", this.name[0]);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "bassboost_set", {
          amount: value,
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    return handler.editReply({ content: " ", embeds: [embed] });
  }
}
