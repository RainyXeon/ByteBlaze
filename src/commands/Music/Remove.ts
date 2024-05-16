import { ApplicationCommandOptionType, Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["remove"];
  public description = "Remove song from queue.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "<position>";
  public aliases = ["rm"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [
    {
      name: "position",
      description: "The position in queue want to remove.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const tracks = handler.args[0];
    if (tracks && isNaN(+tracks))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
            .setColor(client.color),
        ],
      });
    if (Number(tracks) == 0)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "removetrack_already")}`)
            .setColor(client.color),
        ],
      });
    if (Number(tracks) > player.queue.length)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "removetrack_notfound")}`)
            .setColor(client.color),
        ],
      });

    const song = player.queue[Number(tracks) - 1];

    player.queue.splice(Number(tracks) - 1, 1);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.music", "removetrack_desc", {
          name: this.getTitle(client, song),
          duration: new ConvertTime().parse(player.position),
          request: String(song.requester),
        })}`
      )
      .setColor(client.color);

    client.wsl.get(handler.guild!.id)?.send({
      op: "playerQueueRemove",
      guild: handler.guild!.id,
      track: {
        title: song.title,
        uri: song.uri,
        length: song.duration,
        thumbnail: song.artworkUrl,
        author: song.author,
        requester: song.requester
          ? {
              id: (song.requester as any).id,
              username: (song.requester as any).username,
              globalName: (song.requester as any).globalName,
              defaultAvatarURL: (song.requester as any).defaultAvatarURL ?? null,
            }
          : null,
      },
      index: Number(tracks) - 1,
    });

    return handler.editReply({ embeds: [embed] });
  }

  getTitle(client: Manager, tracks: RainlinkTrack): string {
    if (client.config.lavalink.AVOID_SUSPEND) return tracks.title;
    else {
      return `[${tracks.title}](${tracks.uri})`;
    }
  }
}
