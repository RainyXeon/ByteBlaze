import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { Manager } from "../../../manager.js";

export default {
  name: "lofi",
  description: "Play a lofi radio station",
  category: "Music",
  usage: "",
  aliases: [],
  lavalink: true,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "radio_loading")}`,
    );
    const value = "http://stream.laut.fm/lofi.m3u";

    const { channel } = message.member!.voice;
    if (!channel)
      return msg.edit(`${client.i18n.get(language, "music", "radio_invoice")}`);
    if (
      !message
        .guild!.members.cache.get(client.user!.id)!
        .permissions.has(PermissionsBitField.Flags.Connect)
    )
      return msg.edit(`${client.i18n.get(language, "music", "radio_join")}`);
    if (
      !message
        .guild!.members.cache.get(client.user!.id)!
        .permissions.has(PermissionsBitField.Flags.Speak)
    )
      return msg.edit(`${client.i18n.get(language, "music", "radio_speak")}`);

    const player = await client.manager.createPlayer({
      guildId: message.guild!.id,
      voiceId: message.member!.voice.channel!.id,
      textId: message.channel.id,
      deaf: true,
    });

    const result = await player.search(value, { requester: message.author });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return msg.edit({
        content: `${client.i18n.get(language, "music", "radio_match")}`,
      });
    if (result.type === "PLAYLIST")
      for (let track of tracks) player.queue.add(track);
    else player.play(tracks[0]);

    const TotalDuration = StartQueueDuration(tracks);

    if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_playlist", {
            title: tracks[0].title,
            url: value,
            duration: convertTime(TotalDuration),
            songs: String(tracks.length),
            request: String(tracks[0].requester),
          })}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "radio_track", {
            title: tracks[0].title,
            url: tracks[0].uri,
            duration: convertTime(tracks[0].length as number),
            request: String(tracks[0].requester),
          })}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "music", "play_result", {
          title: tracks[0].title,
          url: tracks[0].uri,
          duration: convertTime(tracks[0].length as number),
          request: String(tracks[0].requester),
        })}`,
      );
      msg.edit({ content: " ", embeds: [embed] });
    }
  },
};
