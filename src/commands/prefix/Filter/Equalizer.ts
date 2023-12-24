import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "equalizer";
  description = "Custom Equalizer!";
  category = "Filter";
  usage = "<number>";
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
    const value = args[0];

    if (value && isNaN(+value))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });

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
      return message.reply({ embeds: [embed] });
    } else if (value == "off" || value == "reset") {
      const data = {
        guildId: message.guild!.id,
        playerOptions: {
          filters: {},
        },
      };
      return player["send"](data);
    }

    const bands = value.split(/[ ]+/);
    let bandsStr = "";
    for (let i = 0; i < bands.length; i++) {
      if (i > 13) break;
      if (isNaN(+bands[i]))
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "filters", "eq_number", {
                  num: String(i + 1),
                })}`
              )
              .setColor(client.color),
          ],
        });
      if (Number(bands[i]) > 10)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "filters", "eq_than", {
                  num: String(i + 1),
                })}`
              )
              .setColor(client.color),
          ],
        });
    }

    for (let i = 0; i < bands.length; i++) {
      if (i > 13) break;
      const data = {
        guildId: message.guild!.id,
        playerOptions: {
          filters: {
            equalizer: [{ band: i, gain: Number(bands[i]) / 10 }],
          },
        },
      };
      player["send"](data);
      bandsStr += `${bands[i]} `;
    }

    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "filters", "eq_loading", {
              bands: bandsStr,
            })}`
          )
          .setColor(client.color),
      ],
    });
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "eq_on", {
          bands: bandsStr,
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    return msg.edit({ content: " ", embeds: [embed] });
  }
}
