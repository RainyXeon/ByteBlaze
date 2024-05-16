import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler, ParseMentionEnum } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";
import { ApplicationCommandOptionType, EmbedBuilder, User } from "discord.js";

export default class implements Command {
  public name = ["avatar"];
  public description = "Show your or someone else's profile picture";
  public category = "Image";
  public accessableby = [Accessableby.Member];
  public usage = "<mention>";
  public aliases = [];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public permissions = [];
  public options = [
    {
      name: "user",
      description: "Type your user here",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const data = handler.args[0];
    const getData = await handler.parseMentions(data);

    if (data && getData && getData.type !== ParseMentionEnum.USER)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.getString(handler.language, "error", "arg_error", {
                text: "**@mention**!",
              })}`
            )
            .setColor(client.color),
        ],
      });

    const value = getData.data as User;

    if (value && (value as any) !== "error") {
      const embed = new EmbedBuilder()
        .setTitle(value.username)
        .setImage(`https://cdn.discordapp.com/avatars/${value.id}/${value.avatar}.jpeg?size=300`)
        .setColor(client.color)
        .setTimestamp();
      await handler.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(handler.user!.username)
        .setImage(`https://cdn.discordapp.com/avatars/${handler.user?.id}/${handler.user?.avatar}.jpeg?size=300`)
        .setColor(client.color)
        .setTimestamp();
      await handler.editReply({ embeds: [embed] });
    }
  }
}
