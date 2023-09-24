import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";

export default {
  name: "rate",
  description: "Sets the rate of the song.",
  category: "Filter",
  usage: "",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const value = args[0];

    if (value && isNaN(+value))
      return message.channel.send(
        `${client.i18n.get(language, "music", "number_invalid")}`
      );

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return message.channel.send(
        `${client.i18n.get(language, "noplayer", "no_player")}`
      );
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return message.channel.send(
        `${client.i18n.get(language, "noplayer", "no_voice")}`
      );

    if (Number(value) < 0)
      return message.channel.send(
        `${client.i18n.get(language, "filters", "filter_greater")}`
      );
    if (Number(value) > 10)
      return message.channel.send(
        `${client.i18n.get(language, "filters", "filter_less")}`
      );

    const data = {
      op: "filters",
      guildId: message.guild!.id,
      timescale: { rate: value },
    };

    await player["send"](data);

    const msg = await message.channel.send(
      `${client.i18n.get(language, "filters", "rate_loading", {
        amount: value,
      })}`
    );
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "rate_on", {
          amount: value,
        })}`
      )
      .setColor(client.color);
    await delay(2000);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
