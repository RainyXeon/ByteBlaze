import { Accessableby, Command } from "../../@base/Command.js";
import {
  CommandHandler,
  ParseMentionEnum,
} from "../../@base/CommandHandler.js";
import { Manager } from "../../manager.js";
import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  Message,
  User,
} from "discord.js";

export default class implements Command {
  public name = ["avatar"];
  public description = "Show your or someone else's profile picture";
  public category = "Image";
  public accessableby = Accessableby.Member;
  public usage = "<mention>";
  public aliases = [];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public options = [
    {
      name: "user",
      description: "Type your user here",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ];

  async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const data = handler.args[0];
    const getData = await handler.parseMentions(data);

    if (data && getData && getData.type !== ParseMentionEnum.USER)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "utilities", "arg_error", {
                text: "@mention",
              })}`
            )
            .setColor(client.color),
        ],
      });

    const value = getData.data as User;

    if (value) {
      const embed = new EmbedBuilder()
        .setTitle(value.username + "#" + value.discriminator)
        .setImage(
          `https://cdn.discordapp.com/avatars/${value.id}/${value.avatar}.jpeg?size=300`
        )
        .setColor(client.color)
        .setFooter({
          text: `© ${handler.guild!.members.me!.displayName}`,
          iconURL: client.user!.displayAvatarURL(),
        });
      await handler.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(handler.user?.username + "#" + handler.user?.discriminator)
        .setImage(
          `https://cdn.discordapp.com/avatars/${handler.user?.id}/${handler.user?.avatar}.jpeg?size=300`
        )
        .setColor(client.color)
        .setFooter({
          text: `© ${handler.guild!.members.me!.displayName}`,
          iconURL: client.user!.displayAvatarURL(),
        });
      await handler.editReply({ embeds: [embed] });
    }
  }
}
