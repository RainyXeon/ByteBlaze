import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer } from "../../rainlink/main.js";
const time_regex = /(^[0-9][\d]{0,3}):(0[0-9]{1}$|[1-5]{1}[0-9])/;

// Main code
export default class implements Command {
  public name = ["seek"];
  public description = "Seek timestamp in the song!";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "<time_format. Ex: 999:59>";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [
    {
      name: "time",
      description: "Set the position of the playing track. Example: 0:10 or 120:10",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    let value;
    const time = handler.args[0];

    if (!time_regex.test(time))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "seek_invalid")}`)
            .setColor(client.color),
        ],
      });
    else {
      const [m, s] = time.split(/:/);
      const min = Number(m) * 60;
      const sec = Number(s);
      value = min + sec;
    }

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    if (value * 1000 >= player.queue.current!.duration! || value < 0)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "seek_beyond")}`)
            .setColor(client.color),
        ],
      });
    await player.seek(value * 1000);

    const song_position = player.position;

    let final_res;

    if (song_position < value * 1000) final_res = song_position + value * 1000;
    else final_res = value * 1000;

    const Duration = new FormatDuration().parse(final_res);

    const seeked = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.music", "seek_msg", {
          duration: Duration,
        })}`
      )
      .setColor(client.color);

    handler.editReply({ content: " ", embeds: [seeked] });
  }
}
