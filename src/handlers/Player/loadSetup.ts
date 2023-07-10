import { Manager } from "../../manager.js";
import { Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
  
  /**
   *
   * @param {Client} client
   */

export default async (client: Manager) => {

    client.enSwitch = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setCustomId("spause")
                .setEmoji("⏯"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("sprevious")
                .setEmoji("⬅"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId("sstop")
                .setEmoji("⏹"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("sskip")
                .setEmoji("➡"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setCustomId("sloop")
                .setEmoji("🔄"),
        ]);

    client.diSwitch = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("spause")
                .setEmoji("⏯")
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sprevious")
                .setEmoji("⬅")
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sstop")
                .setEmoji("⏹")
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sskip")
                .setEmoji("➡")
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sloop")
                .setEmoji("🔄")
                .setDisabled(true),
        ]);
};