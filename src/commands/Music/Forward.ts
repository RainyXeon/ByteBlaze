import { EmbedBuilder, Message } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "../../lib/main.js";
const fastForwardNum = 10;

// Main code
export default class implements Command {
  public name = ["forward"];
  public description = "Forward timestamp in the song! (10s)";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public options = [];
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(
      handler.guild!.id
    ) as KazagumoPlayer;

    const song = player.queue.current;
    const song_position = player.shoukaku.position;
    const CurrentDuration = new FormatDuration().parse(
      song_position + fastForwardNum * 1000
    );

    if (song_position + fastForwardNum * 1000 < song!.length!) {
      player.send({
        guildId: handler.guild!.id,
        playerOptions: {
          position: song_position + fastForwardNum * 1000,
        },
      });

      const forward2 = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "music", "forward_msg", {
            duration: CurrentDuration,
          })}`
        )
        .setColor(client.color);

      await handler.editReply({ content: " ", embeds: [forward2] });
    } else {
      return await handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "forward_beyond")}`
            )
            .setColor(client.color),
        ],
      });
    }
  }
}
