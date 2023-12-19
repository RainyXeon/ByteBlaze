import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "play";
  description = "Play a song from any types";
  category = "Music";
  usage = "<name_or_url>";
  aliases = ["p", "pl", "pp"];
  lavalink = true;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    let player = client.manager.players.get(message.guild!.id);
    const value = args[0];

    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "play_loading", {
              result: value,
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

    if (!player)
      player = await client.manager.createPlayer({
        guildId: message.guild!.id,
        voiceId: message.member!.voice.channel!.id,
        textId: message.channel.id,
        deaf: true,
      });
    else if (player && !this.checkSameVoice(message, client, language, msg)) {
      return;
    }

    const result = await player.search(value, { requester: message.author });
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

    const TotalDuration = new StartQueueDuration().parse(tracks);

    await message.delete();

    if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_track", {
            title: tracks[0].title,
            url: tracks[0].uri,
            duration: new ConvertTime().parse(tracks[0].length as number),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [embed] });
    } else if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_playlist", {
            title: tracks[0].title,
            url: value,
            duration: new ConvertTime().parse(TotalDuration),
            songs: String(tracks.length),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "music", "play_result", {
          title: tracks[0].title,
          url: tracks[0].uri,
          duration: new ConvertTime().parse(tracks[0].length as number),
          request: String(tracks[0].requester),
        })}`
      );

      msg.edit({ content: " ", embeds: [embed] });
    }
  }

  checkSameVoice(
    message: Message,
    client: Manager,
    language: string,
    msg: Message
  ) {
    if (
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    ) {
      msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });
      return false;
    }

    return true;
  }
}
