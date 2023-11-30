import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
import { Manager } from "../../../manager.js";
import { EmbedBuilder, Message } from "discord.js";

export default class implements PrefixCommand {
  name = "avatar";
  description = "Show your or someone else's profile picture";
  category = "Image";
  accessableby = Accessableby.Member;
  usage = "<mention>";
  aliases = [];
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const value = message.mentions.users.first();

    if (!value)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "arg_error", {
                text: "@mention",
              })}`
            )
            .setColor(client.color),
        ],
      });

    if (value) {
      const embed = new EmbedBuilder()
        .setTitle(value.username + " " + value.discriminator)
        .setImage(
          `https://cdn.discordapp.com/avatars/${value.id}/${value.avatar}.jpeg?size=300`
        )
        .setColor(client.color)
        .setFooter({
          text: `© ${message.guild!.members.me!.displayName}`,
          iconURL: client.user!.displayAvatarURL(),
        });
      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(
          message.author.username + message.author.discriminator == "0"
            ? ""
            : "#" + message.author.discriminator
        )
        .setImage(
          `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.jpeg?size=300`
        )
        .setColor(client.color)
        .setFooter({
          text: `© ${message.guild!.members.me!.displayName}`,
          iconURL: client.user!.displayAvatarURL(),
        });
      await message.reply({ embeds: [embed] });
    }
  }
}
