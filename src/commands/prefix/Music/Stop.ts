import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, Message } from "discord.js";

// Main code
export default class implements PrefixCommand {
  name = "stop";
  description = "Stop music and make the bot leave the voice channel.";
  category = "Music";
  usage = "";
  aliases = [];
  lavalink = true;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "stop_loading")}`
          )
          .setColor(client.color),
      ],
    });
    const player = client.manager.players.get(message.guild!.id);
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    await player!.destroy();

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "stop_msg", {
          channel: channel.name,
        })}`
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  }
}
