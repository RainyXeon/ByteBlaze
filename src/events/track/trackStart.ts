import { Manager } from "../../manager.js";
import { ComponentType, TextChannel } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { formatDuration } from "../../utilities/FormatDuration.js";
import { filterSelect, playerRowOne, playerRowTwo } from "../../utilities/PlayerControlButton.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { SongNotiEnum } from "../../database/schema/SongNoti.js";
import { RainlinkFilterMode, RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";
import { getTitle } from "../../utilities/GetTitle.js";

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
    if (!SongNoti)
      SongNoti = await client.db.songNoti.set(`${player.guildId}`, SongNotiEnum.Enable);

    if (!player) return;

    /////////// Update Music Setup ///////////

    await client.UpdateQueueMsg(player);

    /////////// Update Music Setup ///////////

    const channel = (await client.channels
      .fetch(player.textId)
      .catch(() => undefined)) as TextChannel;
    if (!channel) return;

    client.emit("trackStart", player);

    if (client.config.utilities.AUTO_RESUME) {
      const autoreconnect = new AutoReconnectBuilderService(client, player);
      const getData = await autoreconnect.get(player.guildId);
      if (!getData) await autoreconnect.playerBuild(player.guildId);
      else {
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
      }
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

    const embeded = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "event.player", "track_title")}`,
        iconURL: `${client.i18n.get(language, "event.player", "track_icon")}`,
      })
      .setDescription(`**${getTitle(client, track)}**`)
      .addFields([
        {
          name: `${client.i18n.get(language, "event.player", "author_title")}`,
          value: `${song!.author}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "event.player", "duration_title")}`,
          value: `${formatDuration(song!.duration)}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "event.player", "request_title")}`,
          value: `${song!.requester}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "event.player", "download_title")}`,
          value: `**[${song!.title} - 000tube.com](https://www.000tube.com/watch?v=${song?.identifier})**`,
          inline: false,
        },
      ])
      .setColor(client.color)
      .setThumbnail(
        track.artworkUrl ?? `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`
      )
      .setTimestamp();

    const playing_channel = (await client.channels
      .fetch(player.textId)
      .catch(() => undefined)) as TextChannel;

    const nplaying = playing_channel
      ? await playing_channel.send({
          embeds: [embeded],
          components: [filterSelect(client), playerRowOne(client), playerRowTwo(client)],
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
            content: `${client.i18n.get(language, "event.player", "join_voice")}`,
            ephemeral: true,
          });
          return false;
        }
      },
    });

    const collectorFilter = nplaying.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (message) => {
        if (
          message.guild!.members.me!.voice.channel &&
          message.guild!.members.me!.voice.channelId === message.member!.voice.channelId
        )
          return true;
        else {
          message.reply({
            content: `${client.i18n.get(language, "event.player", "join_voice")}`,
            ephemeral: true,
          });
          return false;
        }
      },
    });

    client.nplayingMsg.set(player.guildId, {
      coll: collector,
      msg: nplaying,
      filterColl: collectorFilter,
    });

    collectorFilter.on("collect", async (message): Promise<void> => {
      const filterMode = message.values[0] as RainlinkFilterMode;

      if (player.data.get("filter-mode") == filterMode) {
        const embed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "button.music", "filter_already", { name: filterMode })}`
          )
          .setColor(client.color);
        const msg = await message
          .reply({
            embeds: [embed],
          })
          .catch(() => {});
        if (msg)
          setTimeout(
            () => msg.delete().catch(() => {}),
            client.config.utilities.DELETE_MSG_TIMEOUT
          );
        return;
      }

      if (filterMode == "clear" && !player.data.get("filter-mode")) {
        const embed = new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "button.music", "reset_already")}`)
          .setColor(client.color);
        const msg = await message
          .reply({
            embeds: [embed],
          })
          .catch(() => {});
        if (msg)
          setTimeout(
            () => msg.delete().catch(() => {}),
            client.config.utilities.DELETE_MSG_TIMEOUT
          );
        return;
      }

      filterMode == "clear"
        ? player.data.delete("filter-mode")
        : player.data.set("filter-mode", filterMode);
      filterMode == "clear" ? await player.filter.clear() : await player.filter.set(filterMode);

      const embed = new EmbedBuilder()
        .setDescription(
          filterMode == "clear"
            ? `${client.i18n.get(language, "button.music", "reset_on")}`
            : `${client.i18n.get(language, "button.music", "filter_on", { name: filterMode })}`
        )
        .setColor(client.color);

      const msg = await message
        .reply({
          embeds: [embed],
        })
        .catch(() => {});
      if (msg)
        setTimeout(() => msg.delete().catch(() => {}), client.config.utilities.DELETE_MSG_TIMEOUT);
    });

    collector.on("collect", async (message): Promise<void> => {
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

    collectorFilter.on("end", (): void => {
      collectorFilter.removeAllListeners();
    });
  }
}
