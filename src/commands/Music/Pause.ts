import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

export default class implements Command {
  public name = ["pause"];
  public description = "Pause the music!";
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

    await player.pause();

    const embed = new EmbedBuilder()
      .setDescription(`${client.getString(handler.language, "command.music", "pause_msg")}`)
      .setColor(client.color);

    handler.editReply({ content: " ", embeds: [embed] });
  }
}
