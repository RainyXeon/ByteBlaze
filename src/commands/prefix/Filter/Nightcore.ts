import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";

export default {
  name: "nightcore",
  description: "Turning on nightcore filter",
  category: "Filter",
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
      `${client.i18n.get(language, "filters", "filter_loading", {
        name: "nightcore",
      })}`,
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

    const data = {
      op: "filters",
      guildId: message.guild!.id,
      timescale: {
        speed: 1.05,
        pitch: 1.125,
        rate: 1.05,
      },
    };

    await player["send"](data);

    const nightcored = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "filter_on", {
          name: "nightcore",
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [nightcored] });
  },
};
