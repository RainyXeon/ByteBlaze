import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: "mp3",
  description: "Play the music file for the bot",
  category: "Music",
  usage: "",
  aliases: ["file", "f"],
  lavalink: true,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    let player = client.manager.players.get(message.guild!.id);

    const file: any = await message.attachments;

    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "play_loading", {
        result: file.name,
      })}`,
    );

    const { channel } = message.member!.voice;
    if (!channel)
      return msg.edit(`${client.i18n.get(language, "music", "play_invoice")}`);
    if (
      !message
        .guild!.members.cache.get(client.user!.id)!
        .permissions.has(PermissionsBitField.Flags.Connect)
    )
      return msg.edit(`${client.i18n.get(language, "music", "play_join")}`);
    if (
      !message
        .guild!.members.cache.get(client.user!.id)!
        .permissions.has(PermissionsBitField.Flags.Speak)
    )
      return msg.edit(`${client.i18n.get(language, "music", "play_speak")}`);
    if (file.contentType !== "audio/mpeg" && file.contentType !== "audio/ogg")
      return msg.edit(
        `${client.i18n.get(language, "music", "play_invalid_file")}`,
      );
    if (!file.contentType)
      msg.edit(`${client.i18n.get(language, "music", "play_warning_file")}`);

    if (!player)
      player = await client.manager.createPlayer({
        guildId: message.guild!.id,
        voiceId: message.member!.voice.channel!.id,
        textId: message.channel.id,
        deaf: true,
      });

    const result = await player.search(file.attachment, {
      requester: message.author,
    });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return msg.edit({
        content: `${client.i18n.get(language, "music", "play_match")}`,
      });
    if (result.type === "PLAYLIST")
      for (let track of tracks) player.queue.add(track);
    else if (player.playing && result.type === "SEARCH")
      player.queue.add(tracks[0]);
    else if (player.playing && result.type !== "SEARCH")
      for (let track of tracks) player.queue.add(track);
    else player.play(tracks[0]);

    await message.delete();

    if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_playlist", {
            title: file.name,
            url: file.attachment,
            length: String(tracks.length),
          })}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_track", {
            title: file.name,
            url: file.attachment,
          })}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "music", "play_result", {
          title: file.name,
          url: file.attachment,
        })}`,
      );
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else {
      msg.edit(`${client.i18n.get(language, "music", "play_match")}`);
      player.destroy();
    }
  },
};
