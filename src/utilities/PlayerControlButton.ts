import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js'
import { Manager } from '../manager.js'

const playerRowOne = (client: Manager, disable?: boolean) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('stop')
      .setEmoji(client.config.emojis.PLAYER.stop)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('replay')
      .setEmoji(client.config.emojis.PLAYER.previous)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('pause')
      .setEmoji(client.config.emojis.PLAYER.pause)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('skip')
      .setEmoji(client.config.emojis.PLAYER.skip)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('loop')
      .setEmoji(client.config.emojis.PLAYER.loop)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),
  ])

const playerRowTwo = (client: Manager, disable?: boolean) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('shuffle')
      .setEmoji(client.config.emojis.PLAYER.shuffle)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('voldown')
      .setEmoji(client.config.emojis.PLAYER.voldown)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('clear')
      .setEmoji(client.config.emojis.PLAYER.delete)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('volup')
      .setEmoji(client.config.emojis.PLAYER.volup)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('queue')
      .setEmoji(client.config.emojis.PLAYER.queue)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),
  ])

const playerRowOneEdited = (client: Manager, disable?: boolean) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
      .setCustomId('stop')
      .setEmoji(client.config.emojis.PLAYER.stop)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('replay')
      .setEmoji(client.config.emojis.PLAYER.previous)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('pause')
      .setEmoji(client.config.emojis.PLAYER.play)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('skip')
      .setEmoji(client.config.emojis.PLAYER.skip)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),

    new ButtonBuilder()
      .setCustomId('loop')
      .setEmoji(client.config.emojis.PLAYER.loop)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disable),
  ])

const filterSelect = (client: Manager, disable?: boolean) =>
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('filter')
      .setPlaceholder('Choose a filter for better audio experience')
      .addOptions(client.selectMenuOptions)
      .setDisabled(disable)
  )

export { playerRowOne, playerRowOneEdited, playerRowTwo, filterSelect }
