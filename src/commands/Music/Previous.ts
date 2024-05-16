import { Manager } from "../../manager.js";
import { EmbedBuilder, Message } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["previous"];
  public description = "Play the previous song in the queue.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = ["pre"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [];
  public permissions = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;
    const previousIndex = player.queue.previous.length - 1;

    if (
      player.queue.previous.length == 0 ||
      player.queue.previous[0].uri == player.queue.current?.uri ||
      previousIndex < -1
    )
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "previous_notfound")}`)
            .setColor(client.color),
        ],
      });

    player.previous();

    player.data.set("endMode", "previous");

    const embed = new EmbedBuilder()
      .setDescription(`${client.getString(handler.language, "command.music", "previous_msg")}`)
      .setColor(client.color);

    handler.editReply({ content: " ", embeds: [embed] });
  }
}
