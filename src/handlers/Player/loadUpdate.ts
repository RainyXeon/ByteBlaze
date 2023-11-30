import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import { FormatDuration } from "../../structures/FormatDuration.js";
import { QueueDuration } from "../../structures/QueueDuration.js";
import { KazagumoPlayer } from "better-kazagumo";

export class playerLoadUpdate {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.client.UpdateMusic = this.UpdateMusic;
    this.client.UpdateQueueMsg = this.UpdateQueueMsg;
  }

  async UpdateQueueMsg(player: KazagumoPlayer) {
    let data = await this.client.db.setup.get(`${player.guildId}`);
    if (!data) return;
    if (data.enable === false) return;

    let channel = (await this.client.channels.cache.get(
      data.channel
    )) as TextChannel;
    if (!channel) return;

    let playMsg = await channel.messages.fetch(data.playmsg);
    if (!playMsg) return;

    let guildModel = await this.client.db.language.get(`${player.guildId}`);
    if (!guildModel) {
      guildModel = await this.client.db.language.set(
        `language.guild_${player.guildId}`,
        this.client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    const songStrings = [];
    const queuedSongs = player.queue.map(
      (song, i) =>
        `${this.client.i18n.get(language, "setup", "setup_content_queue", {
          index: `${i + 1}`,
          title: song.title,
          duration: new FormatDuration().parse(song.length),
          request: `${song.requester}`,
        })}`
    );

    const current_song = `${this.client.i18n.get(
      language,
      "setup",
      "setup_content_queue",
      {
        index: `${1}`,
        title: player.queue.current!.title,
        duration: new FormatDuration().parse(player.queue.current!.length),
        request: `${player.queue.current!.requester}`,
      }
    )}`;

    await songStrings.push(...queuedSongs);

    await songStrings.unshift(current_song);

    const Str = songStrings.slice(0, 10).join("\n");

    const TotalDuration = new QueueDuration().parse(player);

    let cSong = player.queue.current;
    let qDuration = `${new FormatDuration().parse(TotalDuration)}`;

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `${this.client.i18n.get(language, "setup", "setup_author")}`,
        iconURL: `${this.client.i18n.get(
          language,
          "setup",
          "setup_author_icon"
        )}`,
      })
      .setDescription(
        `${this.client.i18n.get(language, "setup", "setup_desc", {
          title: cSong!.title,
          url: cSong!.uri,
          duration: new FormatDuration().parse(cSong!.length),
          request: `${cSong!.requester}`,
        })}`
      ) // [${cSong.title}](${cSong.uri}) \`[${formatDuration(cSong.duration)}]\` • ${cSong.requester}
      .setColor(this.client.color)
      .setImage(
        `${
          cSong!.thumbnail
            ? cSong!.thumbnail
            : `https://cdn.discordapp.com/avatars/${this.client.user!.id}/${
                this.client.user!.avatar
              }.jpeg?size=300`
        }`
      )
      .setFooter({
        text: `${this.client.i18n.get(language, "setup", "setup_footer", {
          songs: `${player.queue.size}`,
          volume: `${player.volume}`,
          duration: qDuration,
        })}`,
      }); //${player.queue.length} • Song's in Queue | Volume • ${player.volume}% | ${qDuration} • Total Duration

    return await playMsg
      .edit({
        content: `${this.client.i18n.get(
          language,
          "setup",
          "setup_content"
        )}\n${
          Str == ""
            ? `${this.client.i18n.get(
                language,
                "setup",
                "setup_content_empty"
              )}`
            : "\n" + Str
        }`,
        embeds: [embed],
        components: [this.client.enSwitch],
      })
      .catch((e) => {});
  }

  async UpdateMusic(player: KazagumoPlayer) {
    let data = await this.client.db.setup.get(`${player.guildId}`);
    if (!data) return;
    if (data.enable === false) return;

    let channel = (await this.client.channels.cache.get(
      data.channel
    )) as TextChannel;
    if (!channel) return;

    let playMsg = await channel.messages.fetch(data.playmsg);
    if (!playMsg) return;

    let guildModel = await this.client.db.language.get(`${player.guildId}`);
    if (!guildModel) {
      guildModel = await this.client.db.language.set(
        `language.guild_${player.guildId}`,
        this.client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    const queueMsg = `${this.client.i18n.get(
      language,
      "setup",
      "setup_queuemsg"
    )}`;

    const playEmbed = new EmbedBuilder()
      .setColor(this.client.color)
      .setAuthor({
        name: `${this.client.i18n.get(
          language,
          "setup",
          "setup_playembed_author"
        )}`,
      })
      .setImage(
        `https://cdn.discordapp.com/avatars/${this.client.user!.id}/${
          this.client.user!.avatar
        }.jpeg?size=300`
      )
      .setDescription(
        `${this.client.i18n.get(language, "setup", "setup_playembed_desc", {
          clientId: this.client.user!.id,
        })}`
      )
      .setFooter({
        text: `${this.client.i18n.get(
          language,
          "setup",
          "setup_playembed_footer"
        )}`,
      });

    return await playMsg
      .edit({
        content: `${queueMsg}`,
        embeds: [playEmbed],
        components: [this.client.diSwitch],
      })
      .catch((e) => {});
  }
}
