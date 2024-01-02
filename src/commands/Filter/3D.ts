import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["3d"];
  public description = "Turning on 3d filter";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;

  async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(handler.guild!.id);

    const { channel } = handler.member!.voice;
    if (
      !channel ||
      handler.member!.voice.channel !== handler.guild!.members.me!.voice.channel
    )
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const data = {
      guildId: handler.guild!.id,
      playerOptions: {
        filters: {
          rotation: { rotationHz: 0.2 },
        },
      },
    };

    await player?.send(data);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "filter_on", {
          name: "3d",
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    handler.editReply({ content: " ", embeds: [embed] });
  }
}
