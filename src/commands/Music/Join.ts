import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

// Main code
export default class implements Command {
  public name = ["join"];
  public description = "Make the bot join the voice channel.";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["j"];
  public lavalink = true;
  public options = [];
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const { channel } = handler.member!.voice;
    if (!channel)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "join_voice")}`
            )
            .setColor(client.color),
        ],
      });

    let player = client.manager.players.get(handler.guild!.id);

    if (!player)
      player = await client.manager.createPlayer({
        guildId: handler.guild!.id,
        voiceId: handler.member!.voice.channel!.id,
        textId: handler.channel!.id,
        deaf: true,
        volume: client.config.lavalink.DEFAULT_VOLUME ?? 100,
      });
    else if (
      player &&
      !this.checkSameVoice(client, handler, handler.language)
    ) {
      return;
    }

    await client.manager.createPlayer({
      guildId: handler.guild!.id,
      voiceId: handler.member!.voice.channel!.id,
      textId: handler.channel!.id,
      deaf: true,
      volume: client.config.lavalink.DEFAULT_VOLUME ?? 100,
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "music", "join_msg", {
          channel: String(channel),
        })}`
      )
      .setColor(client.color);

    handler.editReply({ content: " ", embeds: [embed] });
  }

  checkSameVoice(client: Manager, handler: CommandHandler, language: string) {
    if (
      handler.member!.voice.channel !== handler.guild!.members.me!.voice.channel
    ) {
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });
      return false;
    } else if (
      handler.member!.voice.channel === handler.guild!.members.me!.voice.channel
    ) {
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "join_already", {
                channel: String(handler.member!.voice.channel),
              })}`
            )
            .setColor(client.color),
        ],
      });
      return false;
    }

    return true;
  }
}
