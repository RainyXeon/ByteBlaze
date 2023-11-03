import { Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "restart",
  description: "Shuts down the client!",
  category: "Admin",
  accessableby: "Owner",
  usage: "",
  aliases: [],
  owner: true,
  premium: false,
  lavalink: false,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const restart = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "utilities", "restart_msg")}`
      )
      .setColor(client.color)
      .setFooter({
        text: `© ${message.guild!.members.me!.displayName}`,
        iconURL: client.user!.displayAvatarURL(),
      });

    await message.reply({ embeds: [restart] });

    process.exit();
  },
};
