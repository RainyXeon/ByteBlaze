import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";

export default {
  name: "equalizer",
  description: "Custom Equalizer!",
  category: "Filter",
  usage: "<number>",
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
      message.member!.voice.channel !== message.guild?.members.me!.voice.channel
    )
      return message.channel.send(
        `${client.i18n.get(language, "noplayer", "no_voice")}`
      );

    if (!value) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "filters", "eq_author")}`,
          iconURL: `${client.i18n.get(language, "filters", "eq_icon")}`,
        })
        .setColor(client.color)
        .setDescription(`${client.i18n.get(language, "filters", "eq_desc")}`)
        .addFields({
          name: `${client.i18n.get(language, "filters", "eq_field_title")}`,
          value: `${client.i18n.get(language, "filters", "eq_field_value", {
            prefix: "/",
          })}`,
          inline: false,
        })
        .setFooter({
          text: `${client.i18n.get(language, "filters", "eq_footer", {
            prefix: "/",
          })}`,
        });
      return message.channel.send({ embeds: [embed] });
    } else if (value == "off" || value == "reset") {
      const data = {
        op: "filters",
        guildId: message.guild.id,
      };
      return player["send"](data);
    }

    const bands = value.split(/[ ]+/);
    let bandsStr = "";
    for (let i = 0; i < bands.length; i++) {
      if (i > 13) break;
      if (isNaN(+bands[i]))
        return message.channel.send(
          `${client.i18n.get(language, "filters", "eq_number", {
            num: String(i + 1),
          })}`
        );
      if (Number(bands[i]) > 10)
        return message.channel.send(
          `${client.i18n.get(language, "filters", "eq_than", {
            num: String(i + 1),
          })}`
        );
    }

    for (let i = 0; i < bands.length; i++) {
      if (i > 13) break;
      const data = {
        op: "filters",
        guildId: message.guild.id,
        equalizer: [{ band: i, gain: Number(bands[i]) / 10 }],
      };
      player["send"](data);
      bandsStr += `${bands[i]} `;
    }

    const msg = await message.channel.send(
      `${client.i18n.get(language, "filters", "eq_loading", {
        bands: bandsStr,
      })}`
    );
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "eq_on", {
          bands: bandsStr,
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    return msg.edit({ content: " ", embeds: [embed] });
  },
};
