import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";
import { Manager } from "../manager.js";

const playerRowOne = (client: Manager) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId("stop")
      .setEmoji(client.config.emojis.PLAYER.stop)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("replay")
      .setEmoji(client.config.emojis.PLAYER.previous)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("pause")
      .setEmoji(client.config.emojis.PLAYER.pause)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("skip")
      .setEmoji(client.config.emojis.PLAYER.skip)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("loop")
      .setEmoji(client.config.emojis.PLAYER.loop)
      .setStyle(ButtonStyle.Secondary),
  ]);

const playerRowTwo = (client: Manager) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId("shuffle")
      .setEmoji(client.config.emojis.PLAYER.shuffle)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("voldown")
      .setEmoji(client.config.emojis.PLAYER.voldown)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("clear")
      .setEmoji(client.config.emojis.PLAYER.delete)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("volup")
      .setEmoji(client.config.emojis.PLAYER.volup)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("queue")
      .setEmoji(client.config.emojis.PLAYER.queue)
      .setStyle(ButtonStyle.Secondary),
  ]);

const playerRowOneEdited = (client: Manager) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId("stop")
      .setEmoji(client.config.emojis.PLAYER.stop)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("replay")
      .setEmoji(client.config.emojis.PLAYER.previous)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("pause")
      .setEmoji(client.config.emojis.PLAYER.play)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("skip")
      .setEmoji(client.config.emojis.PLAYER.skip)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("loop")
      .setEmoji(client.config.emojis.PLAYER.loop)
      .setStyle(ButtonStyle.Secondary),
  ]);

const filterSelect = (client: Manager) =>
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("filter")
      .setPlaceholder("Choose a filter for better audio experience")
      .addOptions(client.selectMenuOptions)
  );

export { playerRowOne, playerRowOneEdited, playerRowTwo, filterSelect };
