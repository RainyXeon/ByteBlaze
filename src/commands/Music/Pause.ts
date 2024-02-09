import { Manager } from "../../manager.js";
import { EmbedBuilder, Message } from "discord.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "../../lib/main.js";

export default class implements Command {
  public name = ["pause"];
  public description = "Pause the music!";
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

    await player.pause(true);

    client.emit("playerPause", player);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "music", "pause_msg")}`
      )
      .setColor(client.color);

    handler.editReply({ content: " ", embeds: [embed] });
  }
}
