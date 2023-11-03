import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";

export default {
  name: "pitch",
  description: "Sets the pitch of the song.",
  category: "Filter",
  usage: "<number>",
  aliases: [],
  owner: false,
  premium: false,
  lavalink: false,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const value = args[0];
    if (value && isNaN(+value))
      return message.reply(
        `${client.i18n.get(language, "music", "number_invalid")}`
      );

    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    if (Number(value) < 0)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "filters", "filter_greater")}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(value) > 10)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "filters", "filter_less")}`
            )
            .setColor(client.color),
        ],
      });

    const data = {
      op: "filters",
      guildId: message.guild!.id,
      timescale: { pitch: value },
    };

    await player["send"](data);

    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "filters", "pitch_loading", {
              amount: value,
            })}`
          )
          .setColor(client.color),
      ],
    });
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "pitch_on", {
          amount: value,
        })}`
      )
      .setColor(client.color);
    await delay(2000);
    msg.edit({ content: " ", embeds: [embed] });
  },
};
