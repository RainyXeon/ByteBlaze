import { Manager } from "../../manager.js";
import { EmbedBuilder, Message } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["replay"];
  public description = "Replay the current song!";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    await player.seek(0);

    const embed = new EmbedBuilder()
      .setDescription(`${client.getString(handler.language, "command.music", "replay_msg")}`)
      .setColor(client.color);

    await handler.editReply({ content: " ", embeds: [embed] });
  }
}
