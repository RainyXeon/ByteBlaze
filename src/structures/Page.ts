import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
} from "discord.js";
import { Manager } from "../manager.js";

export class Page {
  client: Manager;
  pages: EmbedBuilder[];
  timeout: number;
  language: string;

  constructor(client: Manager, pages: EmbedBuilder[], timeout: number, language: string) {
    this.client = client;
    this.pages = pages;
    this.timeout = timeout;
    this.language = language;
  }

  async slashPage(interaction: CommandInteraction) {
    if (!interaction && !(interaction as CommandInteraction).channel)
      throw new Error("Channel is inaccessible.");
    if (!this.pages) throw new Error("Pages are not given.");

    const row1 = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji(this.client.icons.GLOBAL.arrow_previous)
      .setStyle(ButtonStyle.Secondary);
    const row2 = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji(this.client.icons.GLOBAL.arrow_next)
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

    let page = 0;
    const curPage = await interaction.editReply({
      embeds: [
        this.pages[page].setFooter({
          text: `${String(page + 1)}/${String(this.pages.length)}`,
        }),
      ],
      components: [row],
      allowedMentions: { repliedUser: false },
    });
    if (this.pages.length == 0) return;

    const collector = curPage.createMessageComponentCollector({
      filter: (m) => m.user.id === interaction.user.id,
      time: this.timeout,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      if (interaction.customId === "back") {
        page = page > 0 ? --page : this.pages.length - 1;
      } else if (interaction.customId === "next") {
        page = page + 1 < this.pages.length ? ++page : 0;
      }
      curPage
        .edit({
          embeds: [
            this.pages[page].setFooter({
              text: `${String(page + 1)}/${String(this.pages.length)}`,
            }),
          ],
          components: [row],
        })
        .catch(() => null);
    });

    collector.on("end", () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        row1.setDisabled(true),
        row2.setDisabled(true)
      );
      curPage
        .edit({
          embeds: [
            this.pages[page].setFooter({
              text: `${String(page + 1)}/${String(this.pages.length)}`,
            }),
          ],
          components: [disabled],
        })
        .catch(() => null);
      // @ts-ignore
      collector.removeAllListeners();
    });

    return curPage;
  }

  async prefixPage(message: Message) {
    if (!message && !(message as Message).channel) throw new Error("Channel is inaccessible.");
    if (!this.pages) throw new Error("Pages are not given.");

    const row1 = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji(this.client.icons.GLOBAL.arrow_previous)
      .setStyle(ButtonStyle.Secondary);
    const row2 = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji(this.client.icons.GLOBAL.arrow_next)
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

    let page = 0;
    const curPage = await message.reply({
      embeds: [
        this.pages[page].setFooter({
          text: `${String(page + 1)}/${String(this.pages.length)}`,
        }),
      ],
      components: [row],
      allowedMentions: { repliedUser: false },
    });
    if (this.pages.length == 0) return;

    const collector = curPage.createMessageComponentCollector({
      filter: (interaction) =>
        interaction.user.id === message.author.id ? true : false && interaction.deferUpdate(),
      time: this.timeout,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();
      if (interaction.customId === "back") {
        page = page > 0 ? --page : this.pages.length - 1;
      } else if (interaction.customId === "next") {
        page = page + 1 < this.pages.length ? ++page : 0;
      }
      curPage
        .edit({
          embeds: [
            this.pages[page].setFooter({
              text: `${String(page + 1)}/${String(this.pages.length)}`,
            }),
          ],
          components: [row],
        })
        .catch(() => null);
    });
    collector.on("end", () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        row1.setDisabled(true),
        row2.setDisabled(true)
      );
      curPage
        .edit({
          embeds: [
            this.pages[page].setFooter({
              text: `${String(page + 1)}/${String(this.pages.length)}`,
            }),
          ],
          components: [disabled],
        })
        .catch(() => null);
      // @ts-ignore
      collector.removeAllListeners();
    });
    return curPage;
  }
}
