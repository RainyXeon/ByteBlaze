import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoTrack } from "better-kazagumo";

const TrackAdd: KazagumoTrack[] = [];
const TrackExist: string[] = [];
let Result: KazagumoTrack[] | null = null;

export default {
  name: "playlist-save-queue",
  description: "Save the current queue to a playlist",
  category: "Playlist",
  usage: "<playlist_name>",
  aliases: ["pl-sq", "pl-save-queue", "pl-save"],
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
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
    const Plist = value!.replace(/_/g, " ");
    const fullList = await client.db.playlist.all();

    const filter_level_1 = fullList.filter(function (data) {
      return data.value.owner == message.author.id && data.value.name == Plist;
    });

    const playlist = await client.db.playlist.get(`${filter_level_1[0].id}`);

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

    TrackAdd.push(current as KazagumoTrack);
    TrackAdd.push(...queue);

    if (!playlist) Result = TrackAdd;

    if (playlist.tracks) {
      for (let i = 0; i < playlist.tracks.length; i++) {
        const element = playlist.tracks[i].uri;
        TrackExist.push(element);
      }
      Result = TrackAdd.filter((track) => !TrackExist.includes(track.uri));
    }

    if (Result!.length == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "savequeue_no_new_saved", {
            name: Plist,
          })}`
        )
        .setColor(client.color);
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "savequeue_saved", {
          name: Plist,
          tracks: String(queue.length + 1),
        })}`
      )
      .setColor(client.color);
    await message.reply({ embeds: [embed] });

    Result!.forEach(async (track) => {
      await client.db.playlist.push(`${filter_level_1[0].id}.tracks`, {
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
  },
};
