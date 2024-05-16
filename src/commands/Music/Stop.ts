import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["stop"];
  public description = "Stop music and make the bot leave the voice channel.";
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

    const { channel } = handler.member!.voice;

    player.data.set("sudo-destroy", true);
    const is247 = await client.db.autoreconnect.get(`${handler.guild?.id}`);
    player.stop(is247 && is247.twentyfourseven ? false : true);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.music", "stop_msg", {
          channel: channel!.name,
        })}`
      )
      .setColor(client.color);

    await handler.editReply({ content: " ", embeds: [embed] });
  }
}
