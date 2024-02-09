import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { FormatDuration } from "../../utilities/FormatDuration.js";
import { QueueDuration } from "../../utilities/QueueDuration.js";
import { KazagumoPlayer } from "../../lib/main.js";

export class playerLoadUpdate {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader(this.client);
  }

  async loader(client: Manager) {
    client.UpdateQueueMsg = async function (player: KazagumoPlayer) {
      let data = await client.db.setup.get(`${player.guildId}`);
      if (!data) return;
      if (data.enable === false) return;

      let channel = (await client.channels.cache.get(
        data.channel
      )) as TextChannel;
      if (!channel) return;

      let playMsg = await channel.messages.fetch(data.playmsg);
      if (!playMsg) return;

      let guildModel = await client.db.language.get(`${player.guildId}`);
      if (!guildModel) {
        guildModel = await client.db.language.set(
          `${player.guildId}`,
          client.config.bot.LANGUAGE
        );
      }

      const language = guildModel;

      const songStrings = [];
      const queuedSongs = player.queue.map(
        (song, i) =>
          `${client.i18n.get(language, "setup", "setup_content_queue", {
            index: `${i + 1}`,
            title: song.title,
            duration: new FormatDuration().parse(song.length),
            request: `${song.requester}`,
          })}`
      );

      await songStrings.push(...queuedSongs);

      const Str = songStrings.slice(0, 10).join("\n");

      const TotalDuration = new QueueDuration().parse(player);

      let cSong = player.queue.current;
      let qDuration = `${new FormatDuration().parse(TotalDuration)}`;

      let embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "setup", "setup_author")}`,
          iconURL: `${client.i18n.get(language, "setup", "setup_author_icon")}`,
        })
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_desc", {
            title: cSong!.title,
            url: String(cSong!.uri),
            duration: new FormatDuration().parse(cSong!.length),
            request: `${cSong!.requester}`,
          })}`
        ) // [${cSong.title}](${cSong.uri}) \`[${formatDuration(cSong.duration)}]\` • ${cSong.requester}
        .setColor(client.color)
        .setImage(
          `${
            cSong!.thumbnail
              ? cSong!.thumbnail
              : `https://cdn.discordapp.com/avatars/${client.user!.id}/${
                  client.user!.avatar
                }.jpeg?size=300`
          }`
        )
        .setFooter({
          text: `${client.i18n.get(language, "setup", "setup_footer", {
            volume: `${player.volume * 100}`,
            duration: qDuration,
          })}`,
        }); //Volume • ${player.volume}% | Total Duration • ${qDuration}

      const queueString = `${client.i18n.get(
        language,
        "setup",
        "setup_content"
      )}\n${Str == "" ? " " : "\n" + Str}`;

      return await playMsg
        .edit({
          content:
            player.queue.current && player.queue.size == 0 ? " " : queueString,
          embeds: [embed],
          components: [client.enSwitchMod],
        })
        .catch((e) => {});
    };

    /**
     *
     * @param {Player} player
     */
    client.UpdateMusic = async function (player: KazagumoPlayer) {
      let data = await client.db.setup.get(`${player.guildId}`);
      if (!data) return;
      if (data.enable === false) return;

      let channel = (await client.channels.cache.get(
        data.channel
      )) as TextChannel;
      if (!channel) return;

      let playMsg = await channel.messages.fetch(data.playmsg);
      if (!playMsg) return;

      let guildModel = await client.db.language.get(`${player.guildId}`);
      if (!guildModel) {
        guildModel = await client.db.language.set(
          `${player.guildId}`,
          client.config.bot.LANGUAGE
        );
      }

      const language = guildModel;

      const queueMsg = `${client.i18n.get(
        language,
        "setup",
        "setup_queuemsg"
      )}`;

      const playEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(
            language,
            "setup",
            "setup_playembed_author"
          )}`,
        })
        .setImage(
          `https://cdn.discordapp.com/avatars/${client.user!.id}/${
            client.user!.avatar
          }.jpeg?size=300`
        );

      return await playMsg
        .edit({
          content: `${queueMsg}`,
          embeds: [playEmbed],
          components: [client.diSwitch],
        })
        .catch((e) => {});
    };
  }
}
