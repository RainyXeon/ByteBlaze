import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  CommandInteraction,
} from "discord.js";
import { readdirSync } from "fs";
import { stripIndents } from "common-tags";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class implements Command {
  public name = ["help"];
  public description =
    "Guild how to use bot and command explorer. Also a command explorer with fancy ui";
  public category = "Info";
  public accessableby = Accessableby.Member;
  public usage = "";
  public aliases = ["h"];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const category = readdirSync(join(__dirname, "..", "..", "commands"));

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(handler.language, "utilities", "help_author", {
          name: handler.guild!.members.me!.displayName,
        })}`,
      })
      .setDescription(
        stripIndents`${client.i18n.get(handler.language, "help", "welcome", {
          bot: handler.guild!.members.me!.displayName,
        })}
            ${client.i18n.get(handler.language, "help", "intro1", {
              bot: handler.guild!.members.me!.displayName,
            })}
            ${client.i18n.get(handler.language, "help", "intro2")}
            ${client.i18n.get(handler.language, "help", "intro3")}
            ${client.i18n.get(handler.language, "help", "prefix", {
              prefix: `\`${handler.prefix}\``,
            })}
            ${client.i18n.get(handler.language, "help", "ver", {
              botver: client.metadata.version,
            })}
            ${client.i18n.get(handler.language, "help", "djs", {
              djsver: JSON.parse(await fs.readFileSync("package.json", "utf-8"))
                .dependencies["discord.js"],
            })}
            ${client.i18n.get(handler.language, "help", "lavalink", {
              aver: client.metadata.autofix,
            })}
            ${client.i18n.get(handler.language, "help", "codename", {
              codename: client.metadata.codename,
            })}
            `
      )
      .setThumbnail(client.user!.displayAvatarURL({ size: 2048 }))
      .setColor(client.color)
      .setFooter({
        text: `Total Commands: ${client.commands.size}`,
        iconURL: client.user!.displayAvatarURL(),
      });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
      new StringSelectMenuBuilder()
        .setCustomId("help-category")
        .setPlaceholder(
          `${client.i18n.get(handler.language, "utilities", "help_desc")}`
        )
        .setMaxValues(1)
        .setMinValues(1)
        /// Map the category to the select menu
        .setOptions(
          category.map((category: string) => {
            return new StringSelectMenuOptionBuilder()
              .setLabel(category)
              .setValue(category);
          })
        ),
    ]);

    const msg = await handler.editReply({ embeds: [embed], components: [row] });

    let collector = await msg?.createMessageComponentCollector({
      filter: (i) =>
        i.isStringSelectMenu() &&
        i.user &&
        i.message.author.id == client.user!.id &&
        i.user.id == handler.user?.id,
      time: 1000 * 60 * 10,
    });

    collector?.on("collect", async (m) => {
      if (m.isStringSelectMenu()) {
        if (m.customId === "help-category") {
          await m.deferUpdate();
          let [directory] = m.values;

          const embed = new EmbedBuilder()
            .setAuthor({
              name: `${client.i18n.get(
                handler.language,
                "utilities",
                "help_author",
                {
                  name: handler.guild!.members.me!.displayName,
                }
              )}`,
            })
            .setDescription(
              `${client.i18n.get(handler.language, "utilities", "help_prefix", {
                prefix: handler.prefix,
              })}`
            )
            .setThumbnail(client.user!.displayAvatarURL({ size: 2048 }))
            .setColor(client.color)
            .addFields({
              name: `❯  ${directory.toUpperCase()} [${
                client.commands.filter((c) => c.category === directory).size
              }]`,
              value: `${client.commands
                .filter((c) => c.category === directory)
                .filter((c) => {
                  if (handler.interaction) {
                    return c.usingInteraction;
                  } else {
                    return c;
                  }
                })
                .map((c) => {
                  const newName = [...c.name];
                  if (directory.toLowerCase() === "owner")
                    newName.indexOf("sudo") !== -1
                      ? newName.splice(newName.indexOf("sudo"), 1)
                      : true;
                  if (directory.toLowerCase() === "utils")
                    newName.indexOf("settings") !== -1
                      ? newName.splice(newName.indexOf("settings"), 1)
                      : true;
                  if (newName.includes(directory.toLowerCase()))
                    newName.splice(newName.indexOf(directory.toLowerCase()), 1);
                  return `\`${
                    handler.interaction ? newName.join(" ") : newName.join("-")
                  }\``;
                })
                .join(", ")}`,
              inline: false,
            })
            .setFooter({
              text: `${
                handler.guild!.members.me!.displayName
              } | ${client.i18n.get(
                handler.language,
                "utilities",
                "ce_total"
              )} ${client.commands.size}`,
              iconURL: client.user!.displayAvatarURL(),
            });

          msg?.edit({ embeds: [embed] });
        }
      }
    });

    collector?.on("end", async (collected, reason) => {
      if (reason === "time") {
        const timed = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(handler.language, "utilities", "help_timeout", {
              prefix: handler.prefix,
            })}`
          )
          .setColor(client.color);

        msg?.edit({ embeds: [timed], components: [] });
      }
    });
  }
}
