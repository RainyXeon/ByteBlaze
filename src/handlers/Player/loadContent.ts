import { Manager } from "../../manager.js";
import { EmbedBuilder, Message, GuildMember } from "discord.js";
import { ConvertTime } from "../../structures/ConvertTime.js";
import delay from "delay";
import { QueueDuration } from "../../structures/QueueDuration.js";
import { GlobalInteraction } from "../../@types/Interaction.js";

// Button Commands
import { ButtonPrevious } from "./ButtonCommands/Previous.js";
import { ButtonSkip } from "./ButtonCommands/Skip.js";
import { ButtonStop } from "./ButtonCommands/Stop.js";
import { ButtonLoop } from "./ButtonCommands/Loop.js";
import { ButtonPause } from "./ButtonCommands/Pause.js";

/**
 * @param {Client} client
 */

export class playerLoadContent {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.register();
  }

  register() {
    try {
      this.client.on(
        "interactionCreate",
        this.interaction.bind(null, this.client)
      );
      this.client.on("messageCreate", this.message.bind(null, this.client));
    } catch (err) {
      this.client.logger.log({ level: "error", message: err });
    }
  }

  async interaction(
    client: Manager,
    interaction: GlobalInteraction
  ): Promise<void> {
    if (!interaction.guild || interaction.user.bot) return;
    if (!interaction.isButton()) return;
    const { customId, member } = interaction;
    let voiceMember = interaction.guild.members.cache.get(
      (member as GuildMember)!.id
    );
    let channel = voiceMember!.voice.channel;

    let player = await client.manager.players.get(interaction.guild.id);
    if (!player) return;

    const playChannel = client.channels.cache.get(player.textId);
    if (!playChannel) return;

    let guildModel = await client.db.language.get(`${player.guildId}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(
        `${player.guildId}`,
        client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    switch (customId) {
      case "sprevious":
        new ButtonPrevious(client, interaction, channel, language, player);
        break;
      case "sskip":
        new ButtonSkip(client, interaction, channel, language, player);
        break;
      case "sstop":
        new ButtonStop(client, interaction, channel, language, player);
        break;
      case "sloop":
        new ButtonLoop(client, interaction, language, player);
        break;
      case "spause":
        new ButtonPause(client, interaction, channel, language, player);
        break;
      default:
        break;
    }
  }

  async message(client: Manager, message: Message): Promise<void> {
    if (!message.guild || !message.guild.available) return;
    let database = await client.db.setup.get(`${message.guild.id}`);
    let player = client.manager.players.get(message.guild.id);

    if (!database)
      await client.db.setup.set(`${message.guild.id}`, {
        enable: false,
        channel: "",
        playmsg: "",
        voice: "",
        category: "",
      });

    database = await client.db.setup.get(`${message.guild.id}`);

    if (!database!.enable) return;

    let channel = await message.guild.channels.cache.get(database!.channel);
    if (!channel) return;

    if (database!.channel != message.channel.id) return;

    let guildModel = await client.db.language.get(`${message.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.language.set(
        `${message.guild.id}`,
        client.config.bot.LANGUAGE
      );
    }

    const language = guildModel;

    if (message.author.id === client.user!.id) {
      await delay(3000);
      message.delete();
    }

    if (message.author.bot) return;

    const song = message.cleanContent;
    if (!song) return;

    let voiceChannel = await message.member!.voice.channel;
    if (!voiceChannel)
      return message.channel
        .send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${this.client.i18n.get(language, "noplayer", "no_voice")}`
              )
              .setColor(this.client.color),
          ],
        })
        .then((msg: Message) => {
          setTimeout(() => {
            msg.delete();
          }, 4000);
        });

    let msg = await message.channel.messages.fetch(database!.playmsg);

    await message.delete();

    if (!player)
      player = await client.manager.createPlayer({
        guildId: message.guild.id,
        voiceId: message.member!.voice.channel!.id,
        textId: message.channel.id,
        deaf: true,
      });
    else {
      if (
        message.member!.voice.channel !==
        message.guild!.members.me!.voice.channel
      ) {
        msg.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "noplayer", "no_voice")}`
              )
              .setColor(client.color),
          ],
        });
        return;
      }
    }

    const result = await player.search(song, { requester: message.author });
    const tracks = result.tracks;

    if (!result.tracks.length) {
      msg.edit({
        content: `${client.i18n.get(
          language,
          "setup",
          "setup_content"
        )}\n${`${client.i18n.get(language, "setup", "setup_content_empty")}`}`,
      });
      return;
    }
    if (result.type === "PLAYLIST")
      for (let track of tracks) player.queue.add(track);
    else if (player.playing && result.type === "SEARCH")
      player.queue.add(tracks[0]);
    else if (player.playing && result.type !== "SEARCH")
      for (let track of tracks) player.queue.add(track);
    else player.play(tracks[0]);

    const TotalDuration = new QueueDuration().parse(player);

    if (result.type === "PLAYLIST") {
      if (!player.playing) player.play();
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_playlist", {
            title: result.tracks[0].title,
            url: String(result.tracks[0].uri),
            duration: new ConvertTime().parse(TotalDuration),
            songs: `${result.tracks.length}`,
            request: `${result.tracks[0].requester}`,
          })}`
        )
        .setColor(client.color);
      msg.reply({ content: " ", embeds: [embed] });
    } else if (result.type === "TRACK") {
      if (!player.playing) player.play();
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "play_track", {
            title: result.tracks[0].title,
            url: String(result.tracks[0].uri),
            duration: new ConvertTime().parse(
              result.tracks[0].length as number
            ),
            request: `${result.tracks[0].requester}`,
          })}`
        )
        .setColor(client.color);
      msg.reply({ content: " ", embeds: [embed] });
    } else if (result.type === "SEARCH") {
      if (!player.playing) player.play();
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "music", "play_result", {
          title: result.tracks[0].title,
          url: String(result.tracks[0].uri),
          duration: new ConvertTime().parse(result.tracks[0].length as number),
          request: `${result.tracks[0].requester}`,
        })}`
      );
      msg.reply({ content: " ", embeds: [embed] });
    }

    await client.UpdateQueueMsg(player);
  }
}
