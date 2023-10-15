import { EmbedBuilder, ButtonInteraction } from "discord.js";
import { Manager } from "../manager.js";

export async function replyInteraction(
  client: Manager,
  message: ButtonInteraction,
  content: string
) {
  const embed = new EmbedBuilder()
    .setDescription(content)
    .setColor(client.color);

  const msg = await message.reply({ embeds: [embed], ephemeral: false });
  setTimeout(() => {
    msg.delete();
  }, client.config.bot.DELETE_MSG_TIMEOUT);
}
