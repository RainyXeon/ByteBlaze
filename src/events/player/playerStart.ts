import { KazagumoPlayer, KazagumoTrack } from "kazagumo";
import { Manager } from "../../manager.js";
import { ButtonStyle, TextChannel } from "discord.js";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import formatduration from "../../structures/FormatDuration.js";
import { QueueDuration } from "../../structures/QueueDuration.js";

export default async (
  client: Manager,
  player: KazagumoPlayer,
  track: KazagumoTrack,
) => {
  const guild = await client.guilds.cache.get(player.guildId);
  client.logger.info(`Player Started in @ ${guild!.name} / ${player.guildId}`);

  let Control = await client.db.get(`control.guild_${player.guildId}`);
  if (!Control) {
    await client.db.set(`control.guild_${player.guildId}`, "disable");
    Control = client.db.get(`control.guild_${player.guildId}`);
  }

  if (!player) return;

  /////////// Update Music Setup ///////////

  await client.UpdateQueueMsg(player);

  /////////// Update Music Setup ///////////

  const channel = client.channels.cache.get(player.textId) as TextChannel;
  if (!channel) return;

  let data = await client.db.get(`setup.guild_${channel.guild.id}`);
  if (player.textId === data.channel.id) return;

  let guildModel = await client.db.get(`language.guild_${channel.guild.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${channel.guild.id}`,
      "en",
    );
  }

  const language = guildModel;

  const song = player.queue.current;
  const position = player.shoukaku.position;

  console.log(player.queue);

  const TotalDuration = QueueDuration(player);

  if (client.websocket && client.config.features.WEBSOCKET.enable) {
    let webqueue = [];

    player.queue.forEach((track) => {
      webqueue.push({
        title: track.title,
        uri: track.uri,
        length: track.length,
        thumbnail: track.thumbnail,
        author: track.author,
        requester: track.requester, // Just case can push
      });
    });

    await webqueue.unshift({
      title: song!.title,
      uri: song!.uri,
      length: song!.length,
      thumbnail: song!.thumbnail,
      author: song!.author,
      requester: song!.requester,
    });

    if (client.websocket && client.config.features.WEBSOCKET.enable)
      await client.websocket.send(
        JSON.stringify({
          op: "player_start",
          guild: player.guildId,
          current: {
            title: song!.title,
            uri: song!.uri,
            length: song!.length,
            thumbnail: song!.thumbnail,
            author: song!.author,
            requester: song!.requester,
          },
        }),
      );

    if (!client.sent_queue.get(player.guildId)) {
      client.websocket.send(
        JSON.stringify({
          op: "player_queue",
          guild: player.guildId,
          queue: webqueue || [],
        }),
      );
      client.sent_queue.set(player.guildId, true);
    }
  }

  if (Control === "disable") return;

  const embeded = new EmbedBuilder()
    .setAuthor({
      name: `${client.i18n.get(language, "player", "track_title")}`,
      iconURL: `${client.i18n.get(language, "player", "track_icon")}`,
    })
    .setDescription(`**[${track.title}](${track.uri})**`)
    .setColor(client.color)
    .setThumbnail(
      `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`,
    )
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
        value: `${player.volume * 100}%`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "queue_title")}`,
        value: `${player.queue.length}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "duration_title")}`,
        value: `${formatduration(song!.length)}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "total_duration_title")}`,
        value: `${formatduration(TotalDuration)}`,
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
        name: `${client.i18n.get(language, "player", "current_duration_title", {
          current_duration: formatduration(song!.length),
        })}`,
        value: `\`\`\`🔴 | 🎶──────────────────────────────\`\`\``,
        inline: false,
      },
    ])
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId("pause")
      .setEmoji("⏯")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("replay")
      .setEmoji("⬅")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("stop")
      .setEmoji("✖")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("skip")
      .setEmoji("➡")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("loop")
      .setEmoji("🔄")
      .setStyle(ButtonStyle.Success),
  ]);

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId("shuffle")
      .setEmoji("🔀")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("voldown")
      .setEmoji("🔉")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("clear")
      .setEmoji("🗑")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("volup")
      .setEmoji("🔊")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("queue")
      .setEmoji("📋")
      .setStyle(ButtonStyle.Success),
  ]);

  const playing_channel = (await client.channels.cache.get(
    player.textId,
  )) as TextChannel;

  const nplaying = await playing_channel.send({
    embeds: [embeded],
    components: [row, row2],
  });

  const filter = (message: any) => {
    if (
      message.guild!.members.me!.voice.channel &&
      message.guild!.members.me!.voice.channelId ===
        message.member!.voice.channelId
    )
      return true;
    else {
      message.reply({
        content: `${client.i18n.get(language, "player", "join_voice")}`,
        ephemeral: true,
      });
      return false;
    }
  };
  const collector = await nplaying.createMessageComponentCollector({
    filter,
    time: song!.length,
  });

  collector.on("collect", async (message: any) => {
    const id = message.customId;
    if (id === "pause") {
      if (!player) {
        collector.stop();
      }
      await player.pause(!player.paused);
      const uni = player.paused
        ? `${client.i18n.get(language, "player", "switch_pause")}`
        : `${client.i18n.get(language, "player", "switch_resume")}`;

      if (client.websocket && client.config.features.WEBSOCKET.enable)
        await client.websocket.send(
          JSON.stringify({
            op: player.paused ? 3 : 4,
            guild: player.guildId,
          }),
        );

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "player", "pause_msg", {
            pause: uni,
          })}`,
        )
        .setColor(client.color);

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "skip") {
      if (!player) {
        collector.stop();
      }
      await player.skip();

      if (client.websocket && client.config.features.WEBSOCKET.enable)
        await client.websocket.send(
          JSON.stringify({
            op: "skip_track",
            guild: player.guildId,
          }),
        );

      const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "player", "skip_msg")}`)
        .setColor(client.color);

      await nplaying.edit({ embeds: [embeded], components: [] });
      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "stop") {
      if (!player) {
        collector.stop();
      }

      if (client.websocket && client.config.features.WEBSOCKET.enable)
        await client.websocket.send(
          JSON.stringify({
            op: "player_destroy",
            guild: player.guildId,
          }),
        );

      await player.destroy();

      const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "player", "stop_msg")}`)
        .setColor(client.color);

      await nplaying.edit({ embeds: [embeded], components: [] });
      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "shuffle") {
      if (!player) {
        collector.stop();
      }
      await player.queue.shuffle();

      const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "player", "shuffle_msg")}`)
        .setColor(client.color);

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "loop") {
      if (!player) {
        collector.stop();
      }
      const loop_mode = {
        none: "none",
        track: "track",
        queue: "queue",
      };

      if (player.loop === "queue") {
        await player.setLoop(loop_mode.none as "none" | "queue" | "track");

        const unloopall = new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "unloopall")}`)
          .setColor(client.color);
        return await message.reply({ content: " ", embeds: [unloopall] });
      } else if (player.loop === "none") {
        await player.setLoop(loop_mode.queue as "none" | "queue" | "track");
        const loopall = new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "loopall")}`)
          .setColor(client.color);
        return await message.reply({ content: " ", embeds: [loopall] });
      }
    } else if (id === "volup") {
      if (!player) {
        collector.stop();
      }

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "player", "volup_msg", {
            volume: `${player.volume * 100 + 10}`,
          })}`,
        )
        .setColor(client.color);

      if (player.volume * 100 == 100)
        return message.reply({ embeds: [embed], ephemeral: true });

      await player.setVolume(player.volume * 100 + 10);
      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "voldown") {
      if (!player) {
        collector.stop();
      }

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "player", "voldown_msg", {
            volume: `${player.volume * 100 - 10}`,
          })}`,
        )
        .setColor(client.color);

      if (player.volume * 100 == 0)
        return message.reply({ embeds: [embed], ephemeral: true });

      await player.setVolume(player.volume * 100 - 10);

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "replay") {
      if (!player) {
        collector.stop();
      }
      await player["send"]({
        op: "seek",
        guildId: message.guild.id,
        position: 0,
      });

      const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "player", "replay_msg")}`)
        .setColor(client.color);

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "queue") {
      if (!player) {
        collector.stop();
      }
      const song = player.queue.current;
      const qduration = `${formatduration(song!.length)}`;
      const thumbnail = `https://img.youtube.com/vi/${
        song!.identifier
      }/hqdefault.jpg`;

      let pagesNum = Math.ceil(player.queue.length / 10);
      if (pagesNum === 0) pagesNum = 1;

      const songStrings = [];
      for (let i = 0; i < player.queue.length; i++) {
        const song = player.queue[i];
        songStrings.push(
          `**${i + 1}.** [${song.title}](${song.uri}) \`[${formatduration(
            song.length,
          )}]\`
            `,
        );
      }

      const pages = [];
      for (let i = 0; i < pagesNum; i++) {
        const str = songStrings.slice(i * 10, i * 10 + 10).join("");

        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${client.i18n.get(language, "player", "queue_author", {
              guild: message.guild.name,
            })}`,
            iconURL: message.guild.iconURL({ dynamic: true }),
          })
          .setThumbnail(thumbnail)
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "player", "queue_description", {
              track: song!.title,
              track_url: song!.uri,
              duration: formatduration(position),
              requester: `${song!.requester}`,
              list_song: str == "" ? "  Nothing" : "\n" + str,
            })}`,
          )
          .setFooter({
            text: `${client.i18n.get(language, "player", "queue_footer", {
              page: `${i + 1}`,
              pages: `${pagesNum}`,
              queue_lang: `${player.queue.length}`,
              total_duration: qduration,
            })}`,
          });

        pages.push(embed);
      }
      message.reply({ embeds: [pages[0]], ephemeral: true });
    } else if (id === "clear") {
      if (!player) {
        collector.stop();
      }
      await player.queue.clear();

      const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "player", "clear_msg")}`)
        .setColor(client.color);

      message.reply({ embeds: [embed], ephemeral: true });
    }
  });
  collector.on("end", async (collected: any, reason: string) => {
    if (reason === "time") {
      nplaying.edit({ embeds: [embeded], components: [] });
    }
  });
};
