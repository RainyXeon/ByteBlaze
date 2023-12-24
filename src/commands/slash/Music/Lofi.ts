import {
  EmbedBuilder,
  PermissionsBitField,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
const value = "http://stream.laut.fm/lofi.m3u";

export default class implements SlashCommand {
  name = ["lofi"];
  description = "Play a lofi radio station";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "radio_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const { channel } = (interaction.member as GuildMember)!.voice;
    if (!channel)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const player = await client.manager.createPlayer({
      guildId: interaction.guild!.id,
      voiceId: (interaction.member as GuildMember).voice.channel!.id,
      textId: interaction.channel!.id,
      deaf: true,
    });

    const result = await player.search(value, { requester: interaction.user });
    const tracks = result.tracks;

    if (!result.tracks.length)
      return msg.edit({
        content: `${client.i18n.get(language, "music", "radio_match")}`,
      });
    if (result.type === "PLAYLIST")
      for (let track of tracks) player.queue.add(track);
    else player.play(tracks[0]);

    const TotalDuration = new StartQueueDuration().parse(tracks);

    if (result.type === "PLAYLIST") {
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
    } else if (result.type === "TRACK") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "radio_track", {
            title: tracks[0].title,
            url: String(tracks[0].uri),
            duration: new ConvertTime().parse(tracks[0].length as number),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "music", "play_result", {
          title: tracks[0].title,
          url: String(tracks[0].uri),
          duration: new ConvertTime().parse(tracks[0].length as number),
          request: String(tracks[0].requester),
        })}`
      );
      msg.edit({ content: " ", embeds: [embed] });
    }
  }
}
