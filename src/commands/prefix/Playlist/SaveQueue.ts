import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoTrack } from "kazagumo.mod";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

const TrackAdd: KazagumoTrack[] = [];
const TrackExist: string[] = [];
let Result: KazagumoTrack[] | null = null;

export default class implements PrefixCommand {
  name = "playlist-save-queue";
  description = "Save the current queue to a playlist";
  category = "Playlist";
  usage = "<playlist_id>";
  aliases = ["pl-sq", "pl-save-queue"];
  lavalink = true;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = args[0] ? args[0] : null;
    if (value == null)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const playlist = await client.db.playlist.get(`${value}`);

    if (!playlist)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "savequeue_notfound")}`
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== message.author.id)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "savequeue_owner")}`
            )
            .setColor(client.color),
        ],
      });

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });

    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const queue = player.queue.map((track) => track);
    const current = player.queue.current;

    if (queue.length == 0 && !current)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "savequeue_no_tracks")}`
            )
            .setColor(client.color),
        ],
      });

    TrackAdd.push(current as KazagumoTrack);
    TrackAdd.push(...queue);

    if (!playlist) Result = TrackAdd;

    if (playlist.tracks) {
      for (let i = 0; i < playlist.tracks.length; i++) {
        const element = playlist.tracks[i].uri;
        TrackExist.push(element);
      }
      Result = TrackAdd.filter(
        (track) => !TrackExist.includes(String(track.uri))
      );
    }

    if (Result!.length == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "savequeue_no_new_saved", {
            name: value,
          })}`
        )
        .setColor(client.color);
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "savequeue_saved", {
          name: value,
          tracks: String(queue.length + 1),
        })}`
      )
      .setColor(client.color);
    await message.reply({ embeds: [embed] });

    Result!.forEach(async (track) => {
      await client.db.playlist.push(`${value}.tracks`, {
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    TrackAdd.length = 0;
    TrackExist.length = 0;
    Result = null;
  }
}
