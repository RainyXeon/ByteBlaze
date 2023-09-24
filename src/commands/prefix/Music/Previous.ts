import { Manager } from "../../../manager.js";
import { EmbedBuilder, Message } from "discord.js";

// Main code
export default {
  name: "previous",
  description: "Play the previous song in the queue.",
  category: "Music",
  usage: "",
  aliases: ["pre"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "previous_loading")}`
    );

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);
    if (!player.queue.previous)
      return msg.edit(
        `${client.i18n.get(language, "music", "previous_notfound")}`
      );

    await player.queue.unshift(player.queue.previous);
    await player.skip();

    const embed = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "previous_msg")}`)
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
