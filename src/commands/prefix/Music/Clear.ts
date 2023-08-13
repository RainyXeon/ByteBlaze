import { Manager } from "../../../manager.js";
import { EmbedBuilder, Message } from "discord.js";

// Main code
export default {
  name: "clear",
  description: "Clear song in queue!",
  category: "Music",
  usage: "",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "clearqueue_loading")}`,
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
    await player.queue.clear();

    const cleared = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "clearqueue_msg")}`)
      .setColor(client.color);
    msg.edit({ content: " ", embeds: [cleared] });
  },
};
