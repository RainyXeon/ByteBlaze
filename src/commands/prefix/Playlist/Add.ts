import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { KazagumoTrack } from "kazagumo";
import { Manager } from "../../../manager.js";

const TrackAdd: KazagumoTrack[] = [];

export default {
  name: "playlist-add",
  description: "Add song to a playlist",
  category: "Playlist",
  usage: "<playlist_name> <url_or_name>",
  aliases: ["pl-add"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const value = args[0] ? args[0] : null;
    if (value == null || !value)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "invalid")}`
      );
    const input = args[1];

    const PlaylistName = value!.replace(/_/g, " ");
    const Inputed = input;

    const msg = await message.channel.send(
      `${client.i18n.get(language, "playlist", "add_loading")}`
    );
    const result = await client.manager.search(input, {
      requester: message.author,
    });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return msg.edit({
        content: `${client.i18n.get(language, "music", "add_match")}`,
      });
    if (result.type === "PLAYLIST")
      for (let track of tracks) TrackAdd.push(track);
    else TrackAdd.push(tracks[0]);

    const Duration = convertTime(tracks[0].length as number);
    const TotalDuration = StartQueueDuration(tracks);

    if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_playlist", {
            title: tracks[0].title,
            url: Inputed,
            duration: convertTime(TotalDuration),
            track: String(tracks.length),
            user: String(message.author),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_track", {
            title: tracks[0].title,
            url: tracks[0].uri,
            duration: Duration,
            user: String(message.author),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_search", {
            title: tracks[0].title,
            url: tracks[0].uri,
            duration: Duration,
            user: String(message.author),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else {
      //The playlist link is invalid.
      return msg.edit(`${client.i18n.get(language, "playlist", "add_match")}`);
    }

    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == message.author.id &&
        fullList[key].name == PlaylistName
      );
    });

    const playlist = fullList[pid[0]];

    if (playlist.owner !== message.author.id) {
      message.channel.send(
        `${client.i18n.get(language, "playlist", "add_owner")}`
      );
      TrackAdd.length = 0;
      return;
    }
    const LimitTrack = playlist.tracks.length + TrackAdd.length;

    if (LimitTrack > client.config.bot.LIMIT_TRACK) {
      message.channel.send(
        `${client.i18n.get(language, "playlist", "add_limit_track", {
          limit: String(client.config.bot.LIMIT_TRACK),
        })}`
      );
      TrackAdd.length = 0;
      return;
    }

    TrackAdd.forEach(async (track) => {
      await client.db.push(`playlist.${pid[0]}.tracks`, {
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "add_added", {
          count: String(TrackAdd.length),
          playlist: PlaylistName,
        })}`
      )
      .setColor(client.color);

    message.channel.send({ content: " ", embeds: [embed] });
    TrackAdd.length = 0;
  },
};
