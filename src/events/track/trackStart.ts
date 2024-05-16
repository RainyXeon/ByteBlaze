import { Manager } from "../../manager.js";
import { ButtonInteraction, ComponentType, TextChannel } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { playerRowOne, playerRowTwo } from "../../assets/PlayerControlButton.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { SongNotiEnum } from "../../database/schema/SongNoti.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

export default class {
  async execute(client: Manager, player: RainlinkPlayer, track: RainlinkTrack) {
    if (!client.isDatabaseConnected)
      return client.logger.warn(
        "DatabaseService",
        "The database is not yet connected so this event will temporarily not execute. Please try again later!"
      );

    const guild = await client.guilds.fetch(player.guildId).catch(() => undefined);
    client.logger.info("TrackStart", `Track Started in @ ${guild!.name} / ${player.guildId}`);

    let SongNoti = await client.db.songNoti.get(`${player.guildId}`);
    if (!SongNoti) SongNoti = await client.db.songNoti.set(`${player.guildId}`, SongNotiEnum.Enable);

    if (!player) return;

    /////////// Update Music Setup ///////////

    await client.UpdateQueueMsg(player);

    /////////// Update Music Setup ///////////

    const channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;
    if (!channel) return;

    client.emit("trackStart", player);

    const autoreconnect = new AutoReconnectBuilderService(client, player);

    if (await autoreconnect.get(player.guildId)) {
      await client.db.autoreconnect.set(`${player.guildId}.current`, player.queue.current?.uri);
      await client.db.autoreconnect.set(`${player.guildId}.config.loop`, player.loop);

      function queueUri() {
        const res = [];
        for (let data of player.queue) {
          res.push(data.uri);
        }
        return res.length !== 0 ? res : [];
      }

      function previousUri() {
        const res = [];
        for (let data of player.queue.previous) {
          res.push(data.uri);
        }
        return res.length !== 0 ? res : [];
      }

      await client.db.autoreconnect.set(`${player.guildId}.queue`, queueUri());
      await client.db.autoreconnect.set(`${player.guildId}.previous`, previousUri());
    } else {
      await autoreconnect.playerBuild(player.guildId);
    }

    let data = await client.db.setup.get(`${channel.guild.id}`);
    if (data && player.textId === data.channel) return;

    let guildModel = await client.db.language.get(`${channel.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(`${channel.guild.id}`, client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    const song = player.queue.current;

    if (SongNoti == SongNotiEnum.Disable) return;

    function getTitle(tracks: RainlinkTrack): string {
      if (client.config.lavalink.AVOID_SUSPEND) return tracks.title;
      else {
        return `[${tracks.title}](${tracks.uri})`;
      }
    }

    const embeded = new EmbedBuilder()
      .setAuthor({
        name: `${client.getString(language, "event.player", "track_title")}`,
        iconURL: `${client.getString(language, "event.player", "track_icon")}`,
      })
      .setDescription(`**${getTitle(track)}**`)
      .addFields([
        {
          name: `${client.getString(language, "event.player", "author_title")}`,
          value: `${song!.author}`,
          inline: true,
        },
        {
          name: `${client.getString(language, "event.player", "duration_title")}`,
          value: `${new FormatDuration().parse(song!.duration)}`,
          inline: true,
        },
        {
          name: `${client.getString(language, "event.player", "request_title")}`,
          value: `${song!.requester}`,
          inline: true,
        },
        {
          name: `${client.getString(language, "event.player", "download_title")}`,
          value: `**[${song!.title} - 000tube.com](https://www.000tube.com/watch?v=${song?.identifier})**`,
          inline: false,
        },
      ])
      .setColor(client.color)
      .setThumbnail(`https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`)
      .setTimestamp();

    const playing_channel = (await client.channels.fetch(player.textId).catch(() => undefined)) as TextChannel;

    const nplaying = playing_channel
      ? await playing_channel.send({
          embeds: [embeded],
          components: [playerRowOne, playerRowTwo],
          // files: client.config.bot.SAFE_PLAYER_MODE ? [] : [attachment],
        })
      : undefined;

    if (!nplaying) return;

    const collector = nplaying.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (message) => {
        if (
          message.guild!.members.me!.voice.channel &&
          message.guild!.members.me!.voice.channelId === message.member!.voice.channelId
        )
          return true;
        else {
          message.reply({
            content: `${client.getString(language, "event.player", "join_voice")}`,
            ephemeral: true,
          });
          return false;
        }
      },
    });

    client.nplayingMsg.set(player.guildId, { coll: collector, msg: nplaying });

    collector.on("collect", async (message: ButtonInteraction): Promise<void> => {
      const id = message.customId;
      const button = client.plButton.get(id);

      const language = guildModel;

      if (button) {
        try {
          button.run(client, message, String(language), player, nplaying, collector);
        } catch (err) {
          client.logger.error("ButtonError", err);
        }
      }
    });

    collector.on("end", (): void => {
      collector.removeAllListeners();
    });
  }
}
