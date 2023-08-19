import { EmbedBuilder, CommandInteraction, GuildManager } from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { QueueDuration } from "../../../structures/QueueDuration.js";
import { Manager } from "../../../manager.js";
// Main code
export default {
  name: ["nowplaying"],
  description: "Display the song currently playing.",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const realtime = client.config.lavalink.NP_REALTIME;
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "np_loading")}`,
    );
    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);

    const song = player.queue.current;
    const position = player.shoukaku.position;
    const CurrentDuration = formatDuration(position);
    const TotalDuration = formatDuration(song!.length);
    const Thumbnail =
      `https://img.youtube.com/vi/${song!.identifier}/maxresdefault.jpg` ||
      `https://cdn.discordapp.com/avatars/${client.user!.id}/${
        client.user!.avatar
      }.jpeg`;
    const Part = Math.floor((position / song!.length!) * 30);
    const Emoji = player.playing ? "🔴 |" : "⏸ |";

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
      .addFields([
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
          value: `${formatDuration(song!.length)}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(
            language,
            "player",
            "total_duration_title",
          )}`,
          value: `${formatDuration(QueueDuration(player))}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "player", "download_title")}`,
          value: `**[${
            song!.title
          } - y2mate.com](https://www.y2mate.com/youtube/${
            song!.identifier
          })**`,
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
      ])
      .setTimestamp();

    const NEmbed = await msg.edit({ content: " ", embeds: [embeded] });
    var interval = null;

    if (realtime === "true") {
      interval = setInterval(async () => {
        if (!player.playing) return;
        const CurrentDuration = formatDuration(position);
        const Part = Math.floor((position / song!.length!) * 30);
        const Emoji = player.playing ? "🔴 |" : "⏸ |";

        (embeded as any).fields[6] = {
          name: `${client.i18n.get(language, "music", "np_current_duration", {
            current_duration: CurrentDuration,
            total_duration: TotalDuration,
          })}`,
          value: `\`\`\`${Emoji} ${
            "─".repeat(Part) + "🎶" + "─".repeat(30 - Part)
          }\`\`\``,
        };

        if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
      }, 5000);
    } else if (realtime === "false") {
      if (!player.playing) return;
      if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
    }
  },
};
