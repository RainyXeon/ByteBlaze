import { EmbedBuilder, ApplicationCommandOptionType, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pitch"];
  public description = "Sets the pitch of the song.";
  public category = "Filter";
  public accessableby = [Accessableby.Member];
  public usage = "<number>";
  public aliases = ["pitch"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [
    {
      name: "amount",
      description: "The amount of pitch to set the song to.",
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
            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
            .setColor(client.color),
        ],
      });

    const player = client.rainlink.players.get(handler.guild!.id);

    if (Number(value) < 0)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.filter", "filter_greater")}`)
            .setColor(client.color),
        ],
      });
    if (Number(value) > 10)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.filter", "filter_less")}`)
            .setColor(client.color),
        ],
      });

    await player?.filter.setTimescale({ pitch: Number(value) });

    player?.data.set("filter-mode", this.name[0]);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.filter", "pitch_on", {
          amount: value,
        })}`
      )
      .setColor(client.color);
    await handler.editReply({ content: " ", embeds: [embed] });
  }
}
