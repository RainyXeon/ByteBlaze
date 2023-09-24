import { Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder } from "discord.js";

export default {
  name: "restart",
  description: "Shuts down the client!",
  category: "Admin",
  accessableby: "Owner",
  owner: true,
  usage: "",
  aliases: [],

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

    await message.channel.send({ embeds: [restart] });

    process.exit();
  },
};
