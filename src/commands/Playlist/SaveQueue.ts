import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkTrack } from "../../rainlink/main.js";

const TrackAdd: RainlinkTrack[] = [];
const TrackExist: string[] = [];
let Result: RainlinkTrack[] | null = null;

export default class implements Command {
  public name = ["pl", "savequeue"];
  public description = "Save the current queue to a playlist";
  public category = "Playlist";
  public accessableby = [Accessableby.Member];
  public usage = "<playlist_id>";
  public aliases = ["pl-sq"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [
    {
      name: "id",
      description: "The id of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0] ? handler.args[0] : null;

    if (value == null)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
            .setColor(client.color),
        ],
      });

    const playlist = await client.db.playlist.get(`${value}`);

    if (!playlist)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "savequeue_notfound")}`)
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== handler.user?.id)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "savequeue_owner")}`)
            .setColor(client.color),
        ],
      });

    const player = client.rainlink.players.get(handler.guild!.id);

    const queue = player?.queue.map((track) => track);
    const current = player?.queue.current;

    if (queue?.length == 0 && !current)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "noplayer", "savequeue_no_tracks")}`)
            .setColor(client.color),
        ],
      });

    TrackAdd.push(current as RainlinkTrack);
    TrackAdd.push(...queue!);

    if (!playlist) Result = TrackAdd;

    if (playlist.tracks) {
      for (let i = 0; i < playlist.tracks.length; i++) {
        const element = playlist.tracks[i].uri;
        TrackExist.push(element);
      }
      Result = TrackAdd.filter((track) => !TrackExist.includes(String(track.uri)));
    }

    if (Result!.length == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.playlist", "savequeue_no_new_saved", {
            name: value,
          })}`
        )
        .setColor(client.color);
      return handler.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.playlist", "savequeue_saved", {
          name: value,
          tracks: String(queue?.length! + 1),
        })}`
      )
      .setColor(client.color);
    await handler.editReply({ embeds: [embed] });

    Result!.forEach(async (track) => {
      await client.db.playlist.push(`${value}.tracks`, {
        title: track.title,
        uri: track.uri,
        length: track.duration,
        thumbnail: track.artworkUrl,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    TrackAdd.length = 0;
    TrackExist.length = 0;
    Result = null;
  }
}
