import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { NormalModeIcons } from "./NormalModeIcons.js";
import { SafeModeIcons } from "./SafeModeIcons.js";
import { ConfigDataService } from "../services/ConfigDataService.js";
import { Config } from "../@types/Config.js";

const data: Config = new ConfigDataService().data;

let icons = data.bot.SAFE_ICONS_MODE ? SafeModeIcons : NormalModeIcons;

const playerRowOne = new ActionRowBuilder<ButtonBuilder>().addComponents([
  new ButtonBuilder().setCustomId("stop").setEmoji(icons.stop).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("replay").setEmoji(icons.previous).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("pause").setEmoji(icons.pause).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("skip").setEmoji(icons.skip).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("loop").setEmoji(icons.loop).setStyle(ButtonStyle.Secondary),
]);

const playerRowTwo = new ActionRowBuilder<ButtonBuilder>().addComponents([
  new ButtonBuilder().setCustomId("shuffle").setEmoji(icons.shuffle).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("voldown").setEmoji(icons.voldown).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("clear").setEmoji(icons.delete).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("volup").setEmoji(icons.volup).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("queue").setEmoji(icons.queue).setStyle(ButtonStyle.Secondary),
]);

const playerRowOneEdited = new ActionRowBuilder<ButtonBuilder>().addComponents([
  new ButtonBuilder().setCustomId("stop").setEmoji(icons.stop).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("replay").setEmoji(icons.previous).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("pause").setEmoji(icons.play).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("skip").setEmoji(icons.skip).setStyle(ButtonStyle.Secondary),

  new ButtonBuilder().setCustomId("loop").setEmoji(icons.loop).setStyle(ButtonStyle.Secondary),
]);

export { playerRowOne, playerRowOneEdited, playerRowTwo };
