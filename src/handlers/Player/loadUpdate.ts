import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { formatDuration } from "../../utilities/FormatDuration.js";
import { RainlinkPlayer } from "../../rainlink/main.js";
import { getTitle } from "../../utilities/GetTitle.js";

export class PlayerUpdateLoader {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader(this.client);
  }

  async loader(client: Manager) {
    client.UpdateQueueMsg = async function (player: RainlinkPlayer) {
      let data = await client.db.setup.get(`${player.guildId}`);
      if (!data) return;
      if (data.enable === false) return;

      let channel = (await client.channels
        .fetch(data.channel)
        .catch(() => undefined)) as TextChannel;
      if (!channel) return;

      let playMsg = await channel.messages.fetch(data.playmsg).catch(() => undefined);
      if (!playMsg) return;

      let guildModel = await client.db.language.get(`${player.guildId}`);
      if (!guildModel) {
        guildModel = await client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
      }

      const language = guildModel;

      const songStrings = [];
      const queuedSongs = player.queue.map(
        (song, i) =>
          `${client.i18n.get(language, "event.setup", "setup_content_queue", {
            index: `${i + 1}`,
            title: song.title,
            duration: formatDuration(song.duration),
            request: `${song.requester}`,
          })}`
      );

      songStrings.push(...queuedSongs);

      const Str = songStrings.slice(0, 10).join("\n");

      const TotalDuration = player.queue.duration;

      let cSong = player.queue.current;
      let qDuration = `${formatDuration(TotalDuration + Number(player.queue.current?.duration))}`;

      let embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "event.setup", "setup_author")}`,
          iconURL: `${client.i18n.get(language, "event.setup", "setup_author_icon")}`,
        })
        .setDescription(
          `${client.i18n.get(language, "event.setup", "setup_desc", {
            title: getTitle(client, cSong!),
            duration: formatDuration(cSong!.duration),
            request: `${cSong!.requester}`,
          })}`
        ) // [${cSong.title}](${cSong.uri}) \`[${formatDuration(cSong.duration)}]\` • ${cSong.requester}
        .setColor(client.color)
        .setImage(
          `${
            cSong!.artworkUrl
              ? cSong!.artworkUrl
              : `https://cdn.discordapp.com/avatars/${client.user!.id}/${client.user!.avatar}.jpeg?size=300`
          }`
        )
        .setFooter({
          text: `${client.i18n.get(language, "event.setup", "setup_footer", {
            volume: `${player.volume}`,
            duration: qDuration,
          })}`,
        }); //Volume • ${player.volume}% | Total Duration • ${qDuration}

      const queueString = `${client.i18n.get(language, "event.setup", "setup_content")}\n${
        Str == "" ? " " : "\n" + Str
      }`;

      return await playMsg
        .edit({
          content: player.queue.current && player.queue.size == 0 ? " " : queueString,
          embeds: [embed],
          components: [client.enSwitchMod],
        })
        .catch(() => {});
    };

    /**
     *
     * @param {Player} player
     */
    client.UpdateMusic = async function (player: RainlinkPlayer) {
      let data = await client.db.setup.get(`${player.guildId}`);
      if (!data) return;
      if (data.enable === false) return;

      let channel = (await client.channels
        .fetch(data.channel)
        .catch(() => undefined)) as TextChannel;
      if (!channel) return;

      let playMsg = await channel.messages.fetch(data.playmsg).catch(() => undefined);
      if (!playMsg) return;

      let guildModel = await client.db.language.get(`${player.guildId}`);
      if (!guildModel) {
        guildModel = await client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
      }

      const language = guildModel;

      const queueMsg = `${client.i18n.get(language, "event.setup", "setup_queuemsg")}`;

      const playEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(language, "event.setup", "setup_playembed_author")}`,
        })
        .setImage(
          `https://cdn.discordapp.com/avatars/${client.user!.id}/${client.user!.avatar}.jpeg?size=300`
        );

      return await playMsg
        .edit({
          content: `${queueMsg}`,
          embeds: [playEmbed],
          components: [client.diSwitch],
        })
        .catch(() => {});
    };
  }
}
