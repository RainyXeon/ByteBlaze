import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["clearqueue"];
  public description = "Clear song in queue!";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = ["clear", "cq"];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;
    player.queue.clear();

    const cleared = new EmbedBuilder()
      .setDescription(`${client.getString(handler.language, "command.music", "clearqueue_msg")}`)
      .setColor(client.color);
    await handler.editReply({ content: " ", embeds: [cleared] });

    client.wsl.get(handler.guild!.id)?.send({
      op: "playerClearQueue",
      guild: handler.guild!.id,
    });
  }
}
