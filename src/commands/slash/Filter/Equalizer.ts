import {
  EmbedBuilder,
  CommandInteraction,
  GuildMember,
  CommandInteractionOptionResolver,
  ApplicationCommandOptionType,
} from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["filter", "equalizer"];
  description = "Custom Equalizer!";
  category = "Filter";
  lavalink = true;
  accessableby = Accessableby.Member;
  options = [
    {
      name: "bands",
      description: "Number of bands to use (max 14 bands.)",
      type: ApplicationCommandOptionType.String,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("bands");
    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return interaction.editReply({
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
      return interaction.editReply({ embeds: [embed] });
    } else if (value == "off" || value == "reset") {
      const data = {
        guildId: interaction.guild!.id,
        playerOptions: {
          filters: {},
        },
      };
      return player.send(data);
    }

    const bands = value.split(/[ ]+/);
    let bandsStr = "";
    for (let i = 0; i < bands.length; i++) {
      if (i > 13) break;
      if (isNaN(+bands[i]))
        return interaction.editReply({
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
        return interaction.editReply({
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
        guildId: interaction.guild!.id,
        playerOptions: {
          filters: {
            equalizer: [{ band: i, gain: Number(bands[i]) / 10 }],
          },
        },
      };
      player.send(data);
      bandsStr += `${bands[i]} `;
    }

    const msg = await interaction.editReply({
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
