import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "../../lib/main.js";

// Main code
export default class implements Command {
  public name = ["stop"];
  public description = "Stop music and make the bot leave the voice channel.";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(
      handler.guild!.id
    ) as KazagumoPlayer;

    const { channel } = handler.member!.voice;

    player.data.set("sudo-destroy", true);
    player.destroy();

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "music", "stop_msg", {
          channel: channel!.name,
        })}`
      )
      .setColor(client.color);

    await handler.editReply({ content: " ", embeds: [embed] });
  }
}
