import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

// Main code
export default class implements Command {
  public name = ["join"];
  public description = "Make the bot join the voice channel.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = ["j"];
  public lavalink = true;
  public options = [];
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const { channel } = handler.member!.voice;
    if (!channel)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "no_in_voice")}`)
            .setColor(client.color),
        ],
      });

    let player = client.rainlink.players.get(handler.guild!.id);

    if (!player)
      player = await client.rainlink.create({
        guildId: handler.guild!.id,
        voiceId: handler.member!.voice.channel!.id,
        textId: handler.channel!.id,
        shardId: handler.guild?.shardId ?? 0,
        deaf: true,
        volume: client.config.lavalink.DEFAULT_VOLUME ?? 100,
      });
    else if (player && !this.checkSameVoice(client, handler, handler.language)) {
      return;
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.music", "join_msg", {
          channel: String(channel),
        })}`
      )
      .setColor(client.color);

    handler.editReply({ content: " ", embeds: [embed] });
  }

  checkSameVoice(client: Manager, handler: CommandHandler, language: string) {
    if (handler.member!.voice.channel !== handler.guild!.members.me!.voice.channel) {
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "no_same_voice")}`)
            .setColor(client.color),
        ],
      });
      return false;
    } else if (handler.member!.voice.channel === handler.guild!.members.me!.voice.channel) {
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.getString(handler.language, "command.music", "join_already", {
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
