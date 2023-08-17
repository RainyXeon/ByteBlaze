import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  CommandInteraction,
  AnyComponentBuilder,
} from "discord.js";
import { readdirSync } from "fs";
import { stripIndents } from "common-tags";
import { Manager } from "../../../manager.js";
import fs from "fs";

export default {
  name: ["help"],
  description: "Displays all commands that the bot has.",
  category: "Info",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const category = readdirSync("./src/commands/slash");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.guild!.members.me!.displayName} Help Command!`,
        iconURL: interaction.guild!.iconURL() as string,
      })
      .setDescription(
        stripIndents`${client.i18n.get(language, "help", "welcome", {
          bot: interaction.guild!.members.me!.displayName,
        })}
            ${client.i18n.get(language, "help", "intro1", {
              bot: interaction.guild!.members.me!.displayName,
            })}
            ${client.i18n.get(language, "help", "intro2")}
            ${client.i18n.get(language, "help", "intro3")}
            ${client.i18n.get(language, "help", "prefix", { prefix: `\`/\`` })}
            ${client.i18n.get(language, "help", "intro4")}
            ${client.i18n.get(language, "help", "ver", {
              botver: JSON.parse(await fs.readFileSync("package.json", "utf-8"))
                .version,
            })}
            ${client.i18n.get(language, "help", "djs", {
              djsver: JSON.parse(await fs.readFileSync("package.json", "utf-8"))
                .dependencies["discord.js"],
            })}
            ${client.i18n.get(language, "help", "lavalink", {
              aver: "v3.0-beta",
            })}
            `,
      )
      .setThumbnail(client.user!.displayAvatarURL({ size: 2048 }))
      .setColor(client.color);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
      new StringSelectMenuBuilder()
        .setCustomId("help-category")
        .setPlaceholder(
          `${client.i18n.get(language, "utilities", "help_desc")}`,
        )
        .setMaxValues(1)
        .setMinValues(1)
        /// Map the category to the select menu
        .setOptions(
          category.map((category) => {
            return new StringSelectMenuOptionBuilder()
              .setLabel(category)
              .setValue(category);
          }),
        ),
    ]);

    interaction
      .editReply({ embeds: [embed], components: [row] })
      .then(async (msg) => {
        let filter = (i: any) =>
          i.isStringSelectMenu() &&
          i.user &&
          i.message.author.id == client.user!.id;
        let collector = await msg.createMessageComponentCollector({
          filter,
          time: 60000,
        });
        collector.on("collect", async (m) => {
          if (m.isStringSelectMenu()) {
            if (m.customId === "help-category") {
              await m.deferUpdate();
              let [directory] = m.values;

              const cmd = client.slash.filter((c) => c.name === "music");

              const embed = new EmbedBuilder()
                .setAuthor({
                  name: `${
                    interaction.guild!.members.me!.displayName
                  } Help Command!`,
                  iconURL: interaction.guild!.iconURL() as string,
                })
                .setDescription(`The bot prefix is: \`/\``)
                .setThumbnail(client.user!.displayAvatarURL({ size: 2048 }))
                .setColor(client.color)
                .addFields({
                  name: `❯  ${directory.toUpperCase()} [${
                    client.slash.filter((c) => c.category === directory).size
                  }]`,
                  value: `${client.slash
                    .filter((c) => c.category === directory)
                    .map((c) => `\`${c.name.at(-1)}\``)
                    .join(", ")}`,
                  inline: false,
                })
                .setFooter({
                  text: `© ${
                    interaction.guild!.members.me!.displayName
                  } | Total Commands: ${client.slash.size}`,
                  iconURL: client.user!.displayAvatarURL(),
                });

              msg.edit({ embeds: [embed] });
            }
          }
        });

        collector.on("end", async (collected, reason) => {
          if (reason === "time") {
            const timed = new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "utilities", "help_timeout", {
                  prefix: "/",
                })}`,
              )
              .setColor(client.color);

            msg.edit({ embeds: [timed], components: [] });
          }
        });
      });
  },
};
