import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";
import { Manager } from "../manager.js";

export class PageQueue {
  client: Manager;
  pages: EmbedBuilder[];
  timeout: number;
  queueLength: number;
  language: string;

  constructor(client: Manager, pages: EmbedBuilder[], timeout: number, queueLength: number, language: string) {
    this.client = client;
    this.pages = pages;
    this.timeout = timeout;
    this.queueLength = queueLength;
    this.language = language;
  }

  async slashPage(interaction: CommandInteraction, queueDuration: string) {
    if (!interaction && !(interaction as CommandInteraction).channel) throw new Error("Channel is inaccessible.");
    if (!this.pages) throw new Error("Pages are not given.");

    const row1 = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji(this.client.icons.arrow_previous)
      .setStyle(ButtonStyle.Secondary);
    const row2 = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji(this.client.icons.arrow_next)
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

    let page = 0;
    const curPage = await interaction.editReply({
      embeds: [
        this.pages[page].setFooter({
          text: `${this.client.getString(this.language, "command.music", "queue_footer", {
            page: String(page + 1),
            pages: String(this.pages.length),
            queue_lang: String(this.queueLength),
            duration: String(queueDuration),
          })}`,
        }),
      ],
      components: [row],
      allowedMentions: { repliedUser: false },
    });
    if (this.pages.length == 0) return;

    const collector = await curPage.createMessageComponentCollector({
      filter: (m) => m.user.id === interaction.user.id,
      time: this.timeout,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      if (interaction.customId === "back") {
        page = page > 0 ? --page : this.pages.length - 1;
      } else if (interaction.customId === "next") {
        page = page + 1 < this.pages.length ? ++page : 0;
      }
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              queue_lang: String(this.queueLength),
              duration: String(queueDuration),
            })}`,
          }),
        ],
        components: [row],
      });
    });

    collector.on("end", () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        row1.setDisabled(true),
        row2.setDisabled(true)
      );
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              queue_lang: String(this.queueLength),
              duration: String(queueDuration),
            })}`,
          }),
        ],
        components: [disabled],
      });
      collector.removeAllListeners();
    });

    return curPage;
  }

  async slashPlaylistPage(interaction: CommandInteraction) {
    if (!interaction && !(interaction as CommandInteraction).channel) throw new Error("Channel is inaccessible.");
    if (!this.pages) throw new Error("Pages are not given.");

    const row1 = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji(this.client.icons.arrow_previous)
      .setStyle(ButtonStyle.Secondary);
    const row2 = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji(this.client.icons.arrow_next)
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

    let page = 0;
    const curPage = await interaction.editReply({
      embeds: [
        this.pages[page].setFooter({
          text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
            page: String(page + 1),
            pages: String(this.pages.length),
            songs: String(this.queueLength),
          })}`,
        }),
      ],
      components: [row],
      allowedMentions: { repliedUser: false },
    });
    if (this.pages.length == 0) return;

    const collector = await curPage.createMessageComponentCollector({
      filter: (m) => m.user.id === interaction.user.id,
      time: this.timeout,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();
      if (interaction.customId === "back") {
        page = page > 0 ? --page : this.pages.length - 1;
      } else if (interaction.customId === "next") {
        page = page + 1 < this.pages.length ? ++page : 0;
      }
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              songs: String(this.queueLength),
            })}`,
          }),
        ],
        components: [row],
      });
    });
    collector.on("end", () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        row1.setDisabled(true),
        row2.setDisabled(true)
      );
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              songs: String(this.queueLength),
            })}`,
          }),
        ],
        components: [disabled],
      });
      collector.removeAllListeners();
    });
    return curPage;
  }

  async prefixPage(message: Message, queueDuration: string) {
    if (!message && !(message as Message).channel) throw new Error("Channel is inaccessible.");
    if (!this.pages) throw new Error("Pages are not given.");

    const row1 = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji(this.client.icons.arrow_previous)
      .setStyle(ButtonStyle.Secondary);
    const row2 = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji(this.client.icons.arrow_next)
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

    let page = 0;
    const curPage = await message.reply({
      embeds: [
        this.pages[page].setFooter({
          text: `${this.client.getString(this.language, "command.music", "queue_footer", {
            page: String(page + 1),
            pages: String(this.pages.length),
            queue_lang: String(this.queueLength),
            duration: String(queueDuration),
          })}`,
        }),
      ],
      components: [row],
      allowedMentions: { repliedUser: false },
    });
    if (this.pages.length == 0) return;

    const collector = await curPage.createMessageComponentCollector({
      filter: (interaction) => (interaction.user.id === message.author.id ? true : false && interaction.deferUpdate()),
      time: this.timeout,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();
      if (interaction.customId === "back") {
        page = page > 0 ? --page : this.pages.length - 1;
      } else if (interaction.customId === "next") {
        page = page + 1 < this.pages.length ? ++page : 0;
      }
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              queue_lang: String(this.queueLength),
              duration: String(queueDuration),
            })}`,
          }),
        ],
        components: [row],
      });
    });
    collector.on("end", () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        row1.setDisabled(true),
        row2.setDisabled(true)
      );
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              queue_lang: String(this.queueLength),
              duration: String(queueDuration),
            })}`,
          }),
        ],
        components: [disabled],
      });
      collector.removeAllListeners();
    });
    return curPage;
  }

  async prefixPlaylistPage(message: Message) {
    if (!message && !(message as Message).channel) throw new Error("Channel is inaccessible.");
    if (!this.pages) throw new Error("Pages are not given.");

    const row1 = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji(this.client.icons.arrow_previous)
      .setStyle(ButtonStyle.Secondary);
    const row2 = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji(this.client.icons.arrow_next)
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

    let page = 0;
    const curPage = await message.reply({
      embeds: [
        this.pages[page].setFooter({
          text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
            page: String(page + 1),
            pages: String(this.pages.length),
            songs: String(this.queueLength),
          })}`,
        }),
      ],
      components: [row],
      allowedMentions: { repliedUser: false },
    });
    if (this.pages.length == 0) return;

    const collector = await curPage.createMessageComponentCollector({
      filter: (interaction) => (interaction.user.id === message.author.id ? true : false && interaction.deferUpdate()),
      time: this.timeout,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();
      if (interaction.customId === "back") {
        page = page > 0 ? --page : this.pages.length - 1;
      } else if (interaction.customId === "next") {
        page = page + 1 < this.pages.length ? ++page : 0;
      }
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              songs: String(this.queueLength),
            })}`,
          }),
        ],
        components: [row],
      });
    });
    collector.on("end", () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        row1.setDisabled(true),
        row2.setDisabled(true)
      );
      curPage.edit({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.playlist", "view_embed_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              songs: String(this.queueLength),
            })}`,
          }),
        ],
        components: [disabled],
      });
      collector.removeAllListeners();
    });
    return curPage;
  }

  async buttonPage(interaction: ButtonInteraction, queueDuration: string) {
    if (!interaction && !(interaction as CommandInteraction).channel) throw new Error("Channel is inaccessible.");
    if (!this.pages) throw new Error("Pages are not given.");

    const row1 = new ButtonBuilder()
      .setCustomId("back")
      .setEmoji(this.client.icons.arrow_previous)
      .setStyle(ButtonStyle.Secondary);
    const row2 = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji(this.client.icons.arrow_next)
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

    let page = 0;
    const curPage = await interaction.reply({
      embeds: [
        this.pages[page].setFooter({
          text: `${this.client.getString(this.language, "command.music", "queue_footer", {
            page: String(page + 1),
            pages: String(this.pages.length),
            queue_lang: String(this.queueLength),
            duration: String(queueDuration),
          })}`,
        }),
      ],
      components: [row],
      allowedMentions: { repliedUser: false },
      ephemeral: true,
    });
    if (this.pages.length == 0) return;

    const collector = await curPage.createMessageComponentCollector({
      filter: (m) => m.user.id === interaction.user.id,
      time: this.timeout,
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.deferred) await interaction.deferUpdate();

      if (interaction.customId === "back") {
        page = page > 0 ? --page : this.pages.length - 1;
      } else if (interaction.customId === "next") {
        page = page + 1 < this.pages.length ? ++page : 0;
      }
      interaction.editReply({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              queue_lang: String(this.queueLength),
              duration: String(queueDuration),
            })}`,
          }),
        ],
        components: [row],
      });
    });

    collector.on("end", () => {
      const disabled = new ActionRowBuilder<ButtonBuilder>().addComponents(
        row1.setDisabled(true),
        row2.setDisabled(true)
      );
      interaction.editReply({
        embeds: [
          this.pages[page].setFooter({
            text: `${this.client.getString(this.language, "command.music", "queue_footer", {
              page: String(page + 1),
              pages: String(this.pages.length),
              queue_lang: String(this.queueLength),
              duration: String(queueDuration),
            })}`,
          }),
        ],
        components: [disabled],
      });
      collector.removeAllListeners();
    });

    return curPage;
  }
}
