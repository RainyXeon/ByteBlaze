import { Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "control",
  aliases: ["setcontrol"],
  usage: "<input>",
  category: "Utils",
  description: "Change the player mode for the bot",
  accessableby: "Members",

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    if (!message.member!.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return message.channel.send(
        `${client.i18n.get(language, "utilities", "control_perm")}`
      );

    const db = await client.db.get(`control.guild_${message.guild!.id}`);
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "utilities", "control_set", {
          toggle:
            db == "enable"
              ? `${client.i18n.get(language, "music", "disabled")}`
              : `${client.i18n.get(language, "music", "enabled")}`,
        })}`
      )
      .setColor(client.color);

    await message.channel.send({ embeds: [embed] });
    await client.db.set(
      `control.guild_${message.guild!.id}`,
      db == "enable" ? "disable" : "enable"
    );
  },
};
