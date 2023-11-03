import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  CommandInteraction,
  EmbedBuilder,
  Message,
  UserSelectMenuInteraction,
} from "discord.js";
import { Manager } from "../manager.js";

export const SlashPage = async (
  client: Manager,
  interaction: CommandInteraction,
  pages: EmbedBuilder[],
  timeout: number,
  queueLength: number,
  queueDuration: number,
  language: string
) => {
  if (!interaction && !(interaction as CommandInteraction).channel)
    throw new Error("Channel is inaccessible.");
  if (!pages) throw new Error("Pages are not given.");

  const row1 = new ButtonBuilder()
    .setCustomId("back")
    .setEmoji(client.icons.arrow_previous)
    .setStyle(ButtonStyle.Secondary);
  const row2 = new ButtonBuilder()
    .setCustomId("next")
    .setEmoji(client.icons.arrow_next)
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

  let page = 0;
  const curPage = await interaction.editReply({
    embeds: [
      pages[page].setFooter({
        text: `${client.i18n.get(language, "music", "queue_footer", {
          page: String(page + 1),
          pages: String(pages.length),
          queue_lang: String(queueLength),
          duration: String(queueDuration),
        })}`,
      }),
    ],
    components: [row],
    allowedMentions: { repliedUser: false },
  });
  if (pages.length == 0) return;

  const collector = await curPage.createMessageComponentCollector({
    filter: (m) => m.user.id === interaction.user.id,
    time: timeout,
  });

  collector.on("collect", async (interaction) => {
    if (!interaction.deferred) await interaction.deferUpdate();
    if (interaction.customId === "back") {
      page = page > 0 ? --page : pages.length - 1;
    } else if (interaction.customId === "next") {
      page = page + 1 < pages.length ? ++page : 0;
    }
    curPage.edit({
      embeds: [
        pages[page].setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            queue_lang: String(queueLength),
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
        pages[page].setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            queue_lang: String(queueLength),
            duration: String(queueDuration),
          })}`,
        }),
      ],
      components: [disabled],
    });
  });

  return curPage;
};

export const SlashPlaylist = async (
  client: Manager,
  interaction: CommandInteraction,
  pages: EmbedBuilder[],
  timeout: number,
  queueLength: number,
  language: string
) => {
  if (!interaction && !(interaction as CommandInteraction).channel)
    throw new Error("Channel is inaccessible.");
  if (!pages) throw new Error("Pages are not given.");

  const row1 = new ButtonBuilder()
    .setCustomId("back")
    .setEmoji(client.icons.arrow_previous)
    .setStyle(ButtonStyle.Secondary);
  const row2 = new ButtonBuilder()
    .setCustomId("next")
    .setEmoji(client.icons.arrow_next)
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

  let page = 0;
  const curPage = await interaction.editReply({
    embeds: [
      pages[page].setFooter({
        text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
          page: String(page + 1),
          pages: String(pages.length),
          songs: String(queueLength),
        })}`,
      }),
    ],
    components: [row],
    allowedMentions: { repliedUser: false },
  });
  if (pages.length == 0) return;

  const collector = await curPage.createMessageComponentCollector({
    filter: (m) => m.user.id === interaction.user.id,
    time: timeout,
  });

  collector.on("collect", async (interaction) => {
    if (!interaction.deferred) await interaction.deferUpdate();
    if (interaction.customId === "back") {
      page = page > 0 ? --page : pages.length - 1;
    } else if (interaction.customId === "next") {
      page = page + 1 < pages.length ? ++page : 0;
    }
    curPage.edit({
      embeds: [
        pages[page].setFooter({
          text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            songs: String(queueLength),
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
        pages[page].setFooter({
          text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            songs: String(queueLength),
          })}`,
        }),
      ],
      components: [disabled],
    });
  });
  return curPage;
};

export const NormalPage = async (
  client: Manager,
  message: Message,
  pages: EmbedBuilder[],
  timeout: number,
  queueLength: number,
  queueDuration: number,
  language: string
) => {
  if (!message && !(message as Message).channel)
    throw new Error("Channel is inaccessible.");
  if (!pages) throw new Error("Pages are not given.");

  const row1 = new ButtonBuilder()
    .setCustomId("back")
    .setEmoji(client.icons.arrow_previous)
    .setStyle(ButtonStyle.Secondary);
  const row2 = new ButtonBuilder()
    .setCustomId("next")
    .setEmoji(client.icons.arrow_next)
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

  let page = 0;
  const curPage = await message.reply({
    embeds: [
      pages[page].setFooter({
        text: `${client.i18n.get(language, "music", "queue_footer", {
          page: String(page + 1),
          pages: String(pages.length),
          queue_lang: String(queueLength),
          duration: String(queueDuration),
        })}`,
      }),
    ],
    components: [row],
    allowedMentions: { repliedUser: false },
  });
  if (pages.length == 0) return;

  const collector = await curPage.createMessageComponentCollector({
    filter: (interaction) =>
      interaction.user.id === message.author.id
        ? true
        : false && interaction.deferUpdate(),
    time: timeout,
  });

  collector.on("collect", async (interaction) => {
    if (!interaction.deferred) await interaction.deferUpdate();
    if (interaction.customId === "back") {
      page = page > 0 ? --page : pages.length - 1;
    } else if (interaction.customId === "next") {
      page = page + 1 < pages.length ? ++page : 0;
    }
    curPage.edit({
      embeds: [
        pages[page].setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            queue_lang: String(queueLength),
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
        pages[page].setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            queue_lang: String(queueLength),
            duration: String(queueDuration),
          })}`,
        }),
      ],
      components: [disabled],
    });
  });
  return curPage;
};

export const NormalPlaylist = async (
  client: Manager,
  message: Message,
  pages: EmbedBuilder[],
  timeout: number,
  queueLength: number,
  language: string
) => {
  if (!message && !(message as Message).channel)
    throw new Error("Channel is inaccessible.");
  if (!pages) throw new Error("Pages are not given.");

  const row1 = new ButtonBuilder()
    .setCustomId("back")
    .setEmoji(client.icons.arrow_previous)
    .setStyle(ButtonStyle.Secondary);
  const row2 = new ButtonBuilder()
    .setCustomId("next")
    .setEmoji(client.icons.arrow_next)
    .setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(row1, row2);

  let page = 0;
  const curPage = await message.reply({
    embeds: [
      pages[page].setFooter({
        text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
          page: String(page + 1),
          pages: String(pages.length),
          songs: String(queueLength),
        })}`,
      }),
    ],
    components: [row],
    allowedMentions: { repliedUser: false },
  });
  if (pages.length == 0) return;

  const collector = await curPage.createMessageComponentCollector({
    filter: (interaction) =>
      interaction.user.id === message.author.id
        ? true
        : false && interaction.deferUpdate(),
    time: timeout,
  });

  collector.on("collect", async (interaction) => {
    if (!interaction.deferred) await interaction.deferUpdate();
    if (interaction.customId === "back") {
      page = page > 0 ? --page : pages.length - 1;
    } else if (interaction.customId === "next") {
      page = page + 1 < pages.length ? ++page : 0;
    }
    curPage.edit({
      embeds: [
        pages[page].setFooter({
          text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            songs: String(queueLength),
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
        pages[page].setFooter({
          text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
            page: String(page + 1),
            pages: String(pages.length),
            songs: String(queueLength),
          })}`,
        }),
      ],
      components: [disabled],
    });
  });
  return curPage;
};
