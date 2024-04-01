import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["skipto"];
  public description = "Skip to a specific position";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["j"];
  public lavalink = true;
  public options = [
    {
      name: "position",
      description: "The position of the song",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const getPosition = Number(handler.args[0]);

    if (!handler.args[0] ||
      isNaN(getPosition) || 
      getPosition == 0 ||
      getPosition >= player.queue.length)
      return handler.editReply({
        embeds: [new EmbedBuilder().setDescription(`The number is invalid`).setColor(client.color)],
      });

    if (player.queue.size == 0 && player.data.get("autoplay") !== true) {
      const skipped = new EmbedBuilder()
        .setDescription(`${client.getString(handler.language, "command.music", "skip_notfound")}`)
        .setColor(client.color);

      handler.editReply({ content: " ", embeds: [skipped] });
    } else {
      const cuttedQueue = player.queue.splice(0, getPosition);
      const nowCurrentTrack = cuttedQueue.splice(0, 1)[0];
      player.queue.previous.push(...cuttedQueue);
      await player.play(nowCurrentTrack);
      const skipped = new EmbedBuilder()
        .setDescription(`${client.getString(handler.language, "command.music", "skip_msg")}`)
        .setColor(client.color);
      handler.editReply({ content: " ", embeds: [skipped] });
    }
  }
}
