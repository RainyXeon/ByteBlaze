import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { StartQueueDuration } from "../../../structures/QueueDuration.js";

// Main code
export default class implements SlashCommand {
  name = ["mp3"];
  description = "Play the music file for the bot";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "file",
      description: "The music file to play",
      type: ApplicationCommandOptionType.Attachment,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    let player;
    await interaction.deferReply({ ephemeral: false });

    const file = await (
      interaction.options as CommandInteractionOptionResolver
    ).getAttachment("file");
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "247_loading")}`
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

    if (file!.contentType !== "audio/mpeg" && file!.contentType !== "audio/ogg")
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_invalid_file")}`
            )
            .setColor(client.color),
        ],
      });
    if (!file!.contentType)
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
        guildId: interaction.guild!.id,
        voiceId: (interaction.member as GuildMember).voice.channel!.id,
        textId: interaction.channel!.id,
        deaf: true,
      });

    const result = await player.search(file!.proxyURL, {
      requester: interaction.user,
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

    const TotalDuration = new StartQueueDuration().parse(tracks);

    if (result.type === "PLAYLIST") {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_playlist", {
            title: file!.name,
            url: String(file?.proxyURL),
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
          `${client.i18n.get(language, "music", "play_track", {
            title: file!.name,
            url: String(file?.proxyURL),
            duration: new ConvertTime().parse(tracks[0].length as number),
            request: String(tracks[0].requester),
          })}`
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
      if (!player.playing) player.play();
    } else if (result.type === "SEARCH") {
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "music", "play_result", {
          title: file!.name,
          url: String(file?.proxyURL),
          duration: new ConvertTime().parse(tracks[0].length as number),
          request: String(tracks[0].requester),
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
