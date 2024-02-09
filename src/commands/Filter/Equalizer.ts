import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import delay from "delay";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["equalizer"];
  public description = "Custom Equalizer!";
  public category = "Filter";
  public accessableby = Accessableby.Member;
  public usage = "<number>";
  public aliases = ["equalizer"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [
    {
      name: "bands",
      description: "Number of bands to use (max 14 bands.)",
      type: ApplicationCommandOptionType.String,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0];

    if (value && isNaN(+value))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });

    const player = client.manager.players.get(handler.guild!.id);

    if (!value) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(handler.language, "filters", "eq_author")}`,
          iconURL: `${client.i18n.get(handler.language, "filters", "eq_icon")}`,
        })
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(handler.language, "filters", "eq_desc")}`
        )
        .addFields({
          name: `${client.i18n.get(
            handler.language,
            "filters",
            "eq_field_title"
          )}`,
          value: `${client.i18n.get(
            handler.language,
            "filters",
            "eq_field_value",
            {
              prefix: handler.prefix,
            }
          )}`,
          inline: false,
        })
        .setFooter({
          text: `${client.i18n.get(handler.language, "filters", "eq_footer", {
            prefix: handler.prefix,
          })}`,
        });
      return handler.editReply({ embeds: [embed] });
    } else if (value == "off" || value == "reset") {
      const data = {
        guildId: handler.guild!.id,
        playerOptions: {
          filters: {},
        },
      };
      return player?.send(data);
    }

    const bands = value.split(/[ ]+/);
    let bandsStr = "";
    for (let i = 0; i < bands.length; i++) {
      if (i > 13) break;
      if (isNaN(+bands[i]))
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "filters", "eq_number")}`
              )
              .setColor(client.color),
          ],
        });
      if (Number(bands[i]) > 10)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "filters", "eq_than")}`
              )
              .setColor(client.color),
          ],
        });

      if (Number(bands[i]) < -10)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "filters", "eq_greater")}`
              )
              .setColor(client.color),
          ],
        });
    }

    for (let i = 0; i < bands.length; i++) {
      if (i > 13) break;
      const data = {
        guildId: handler.guild!.id,
        playerOptions: {
          filters: {
            equalizer: [{ band: i, gain: Number(bands[i]) / 10 }],
          },
        },
      };
      player?.send(data);
      bandsStr += `${bands[i]} `;
    }

    player?.data.set("filter-mode", this.name[0]);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "filters", "eq_on", {
          bands: bandsStr,
        })}`
      )
      .setColor(client.color);

    await delay(2000);
    return handler.editReply({ content: " ", embeds: [embed] });
  }
}
