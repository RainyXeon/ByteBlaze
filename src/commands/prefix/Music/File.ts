import {
  Attachment,
  Collection,
  EmbedBuilder,
  Message,
  PermissionsBitField,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

// Main code
export default class implements PrefixCommand {
  name = "mp3";
  description = "Play the music file for the bot";
  category = "Music";
  usage = "";
  aliases = ["file", "f"];
  accessableby = Accessableby.Member;
  lavalink = true;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    let player = client.manager.players.get(message.guild!.id);

    const file: Attachment = await [
      ...message.attachments.map((data) => {
        return data;
      }),
    ][0];

    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "play_loading", {
              result: file.name,
            })}`
          )
          .setColor(client.color),
      ],
    });

    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    if (file.contentType !== "audio/mpeg" && file.contentType !== "audio/ogg")
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_invalid_file")}`
            )
            .setColor(client.color),
        ],
      });
    if (!file.contentType)
      msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_warning_file")}`
            )
            .setColor(client.color),
        ],
      });

    if (!player)
      player = await client.manager.createPlayer({
        guildId: message.guild!.id,
        voiceId: message.member!.voice.channel!.id,
        textId: message.channel.id,
        deaf: true,
      });

    const result = await player.search(file.url, {
      requester: message.author,
    });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_match")}`
            )
            .setColor(client.color),
        ],
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
            url: file.url,
            length: String(tracks.length),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_track", {
            title: file.name,
            url: file.url,
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "music", "play_result", {
          title: file.name,
          url: file.url,
        })}`
      );
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else {
      msg.edit(`${client.i18n.get(language, "music", "play_match")}`);
      player.destroy();
    }
  }
}
