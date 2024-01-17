import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "../../lib/main.js";

// Main code
export default class implements Command {
  public name = ["shuffle"];
  public description = "Shuffle song in queue!";
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

    await player.queue.shuffle();

    const shuffle = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "music", "shuffle_msg")}`
      )
      .setColor(client.color);

    await handler.editReply({ content: " ", embeds: [shuffle] });
  }
}
