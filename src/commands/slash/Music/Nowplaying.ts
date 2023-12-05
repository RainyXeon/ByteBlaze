import { EmbedBuilder, CommandInteraction, GuildManager } from "discord.js";
import { FormatDuration } from "../../../structures/FormatDuration.js";
import { QueueDuration } from "../../../structures/QueueDuration.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
// Main code
export default class implements SlashCommand {
  name = ["nowplaying"];
  description = "Display the song currently playing.";
  category = "Music";
  accessableby = Accessableby.Member;
  options = [];
  lavalink = true;

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const realtime = client.config.lavalink.NP_REALTIME;
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "np_loading")}`)
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });

    const song = player.queue.current;
    const position = player.position;
    const CurrentDuration = new FormatDuration().parse(position);
    const TotalDuration = new FormatDuration().parse(song!.length);
    const Thumbnail =
      `https://img.youtube.com/vi/${song!.identifier}/maxresdefault.jpg` ||
      `https://cdn.discordapp.com/avatars/${client.user!.id}/${
        client.user!.avatar
      }.jpeg`;
    const Part = Math.floor((position / song!.length!) * 30);
    const Emoji = player.playing ? "🔴 |" : "⏸ |";

    const fieldDataGlobal = [
      {
        name: `${client.i18n.get(language, "player", "author_title")}`,
        value: `${song!.author}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "request_title")}`,
        value: `${song!.requester}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "volume_title")}`,
        value: `${player.volume}%`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "queue_title")}`,
        value: `${player.queue.length}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "duration_title")}`,
        value: `${new FormatDuration().parse(song!.length)}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "total_duration_title")}`,
        value: `${new FormatDuration().parse(
          new QueueDuration().parse(player)
        )}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "download_title")}`,
        value: `**[${
          song!.title
        } - y2mate.com](https://www.y2mate.com/youtube/${song!.identifier})**`,
        inline: false,
      },
      {
        name: `${client.i18n.get(language, "music", "np_current_duration", {
          current_duration: CurrentDuration,
          total_duration: TotalDuration,
        })}`,
        value: `\`\`\`${Emoji} ${
          "─".repeat(Part) + "🎶" + "─".repeat(30 - Part)
        }\`\`\``,
        inline: false,
      },
    ];

    const embeded = new EmbedBuilder()
      .setAuthor({
        name: player.playing
          ? `${client.i18n.get(language, "music", "np_title")}`
          : `${client.i18n.get(language, "music", "np_title_pause")}`,
        iconURL: `${client.i18n.get(language, "music", "np_icon")}`,
      })
      .setColor(client.color)
      .setDescription(`**[${song!.title}](${song!.uri})**`)
      .setThumbnail(Thumbnail)
      .addFields(fieldDataGlobal)
      .setTimestamp();

    const NEmbed = await msg.edit({ content: " ", embeds: [embeded] });
    var interval = null;

    if (realtime) {
      interval = setInterval(async () => {
        if (!player.playing) return;
        const nowDuration = new FormatDuration().parse(
          player.shoukaku.position
        );
        const Part = Math.floor(
          (player.shoukaku.position / song!.length!) * 30
        );
        const Emoji = player.playing ? "🔴 |" : "⏸ |";
        const editedField = fieldDataGlobal;

        editedField.splice(7, 1);
        editedField.push({
          name: `${client.i18n.get(language, "music", "np_current_duration", {
            current_duration: nowDuration,
            total_duration: TotalDuration,
          })}`,
          value: `\`\`\`${Emoji} ${
            "─".repeat(Part) + "🎶" + "─".repeat(30 - Part)
          }\`\`\``,
          inline: false,
        });

        const embeded = new EmbedBuilder()
          .setAuthor({
            name: player.playing
              ? `${client.i18n.get(language, "music", "np_title")}`
              : `${client.i18n.get(language, "music", "np_title_pause")}`,
            iconURL: `${client.i18n.get(language, "music", "np_icon")}`,
          })
          .setColor(client.color)
          .setDescription(`**[${song!.title}](${song!.uri})**`)
          .setThumbnail(Thumbnail)
          .addFields(editedField)
          .setTimestamp();

        if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
      }, 5000);
    } else if (!realtime) {
      if (!player.playing) return;
      if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
    }
  }
}
