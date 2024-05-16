import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["nowplaying"];
  public description = "Display the song currently playing.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = ["np"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const realtime = client.config.lavalink.NP_REALTIME;

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const song = player.queue.current;
    const position = player.position;
    const CurrentDuration = new FormatDuration().parse(position);
    const TotalDuration = new FormatDuration().parse(song!.duration);
    const Thumbnail =
      `https://img.youtube.com/vi/${song!.identifier}/maxresdefault.jpg` ||
      `https://cdn.discordapp.com/avatars/${client.user!.id}/${client.user!.avatar}.jpeg`;
    const Part = Math.floor((position / song!.duration!) * 30);

    const fieldDataGlobal = [
      {
        name: `${client.getString(handler.language, "event.player", "author_title")}`,
        value: `${song!.author}`,
        inline: true,
      },
      {
        name: `${client.getString(handler.language, "event.player", "duration_title")}`,
        value: `${new FormatDuration().parse(song!.duration)}`,
        inline: true,
      },
      {
        name: `${client.getString(handler.language, "event.player", "volume_title")}`,
        value: `${player.volume}%`,
        inline: true,
      },
      {
        name: `${client.getString(handler.language, "event.player", "queue_title")}`,
        value: `${player.queue.length}`,
        inline: true,
      },
      {
        name: `${client.getString(handler.language, "event.player", "total_duration_title")}`,
        value: `${new FormatDuration().parse(player.queue.duration)}`,
        inline: true,
      },
      {
        name: `${client.getString(handler.language, "event.player", "request_title")}`,
        value: `${song!.requester}`,
        inline: true,
      },
      {
        name: `${client.getString(handler.language, "event.player", "download_title")}`,
        value: `**[${song!.title}](https://www.000tube.com/watch?v=${song?.identifier})**`,
        inline: false,
      },
      {
        name: `${client.getString(handler.language, "command.music", "np_current_duration", {
          current_duration: CurrentDuration,
          total_duration: TotalDuration,
        })}`,
        value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
        inline: false,
      },
    ];

    const embeded = new EmbedBuilder()
      .setAuthor({
        name: `${client.getString(handler.language, "command.music", "np_title")}`,
        iconURL: `${client.getString(handler.language, "command.music", "np_icon")}`,
      })
      .setColor(client.color)
      .setDescription(`**${this.getTitle(client, song!)}**`)
      .setThumbnail(Thumbnail)
      .addFields(fieldDataGlobal)
      .setTimestamp();

    const NEmbed = await handler.editReply({ content: " ", embeds: [embeded] });

    const currentNP = client.nowPlaying.get(`${handler.guild?.id}`);
    if (currentNP) {
      clearInterval(currentNP.interval);
      await currentNP.msg?.delete().catch(() => null);
      client.nowPlaying.delete(`${handler.guild?.id}`);
    }

    if (realtime) {
      const interval: NodeJS.Timeout = setInterval(async () => {
        let currentNPInterval = client.nowPlaying.get(`${handler.guild?.id}`);
        if (!currentNPInterval)
          currentNPInterval = client.nowPlaying
            .set(`${handler.guild?.id}`, {
              interval: interval,
              msg: NEmbed,
            })
            .get(`${handler.guild?.id}`);
        if (!player.queue.current) return clearInterval(interval);
        if (!player.playing) return;
        const CurrentDuration = new FormatDuration().parse(player.position);
        const Part = Math.floor((player.position / song!.duration!) * 30);

        const editedField = fieldDataGlobal;

        editedField.splice(7, 1);
        editedField.push({
          name: `${client.getString(handler.language, "command.music", "np_current_duration", {
            current_duration: CurrentDuration,
            total_duration: TotalDuration,
          })}`,
          value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
          inline: false,
        });

        const embeded = new EmbedBuilder()
          .setAuthor({
            name: `${client.getString(handler.language, "command.music", "np_title")}`,
            iconURL: `${client.getString(handler.language, "command.music", "np_icon")}`,
          })
          .setColor(client.color)
          .setDescription(`**${this.getTitle(client, song!)}**`)
          .setThumbnail(Thumbnail)
          .addFields(editedField)
          .setTimestamp();

        try {
          const channel = (await client.channels.fetch(`${handler.channel?.id}`).catch(() => undefined)) as TextChannel;
          if (!channel) return;
          const message = await channel.messages.fetch(`${currentNPInterval?.msg?.id}`).catch(() => undefined);
          if (!message) return;
          if (currentNPInterval && currentNPInterval.msg)
            currentNPInterval.msg.edit({ content: " ", embeds: [embeded] });
        } catch (err) {
          return;
        }
      }, 5000);
    } else if (!realtime) {
      if (!player.playing) return;
      if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
    }
  }

  getTitle(client: Manager, tracks: RainlinkTrack): string {
    if (client.config.lavalink.AVOID_SUSPEND) return tracks.title;
    else {
      return `[${tracks.title}](${tracks.uri})`;
    }
  }
}
