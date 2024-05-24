import { ApplicationCommandOptionType, EmbedBuilder, User } from "discord.js";
import moment from "moment";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler, ParseMentionEnum } from "../../structures/CommandHandler.js";
import { Premium } from "../../database/schema/Premium.js";

export default class implements Command {
  public name = ["pm", "profile"];
  public description = "View your premium profile!";
  public category = "Premium";
  public accessableby = [Accessableby.Member];
  public usage = "";
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

    let user = handler.user;
    const data = handler.args[0];
    const getData = await handler.parseMentions(data);
    if (data && getData && getData.type == ParseMentionEnum.USER) user = getData.data as User;

    if (user?.id == client.owner) return this.owner(client, handler);
    if (client.config.bot.ADMIN.includes(user?.id ?? "null")) return this.admin(client, handler);

    const PremiumPlan = (await client.db.premium.get(`${handler.user?.id}`)) as Premium;

    if (!PremiumPlan) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(handler.language, "command.premium", "profile_author")}`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setDescription(
          `${client.i18n.get(handler.language, "command.premium", "profile_error_desc", { user: String(user?.username) })}`
        )
        .setColor(client.color)
        .setTimestamp();
      return handler.editReply({
        content: " ",
        embeds: [embed],
      });
    }

    const expires = moment(
      PremiumPlan && PremiumPlan.expiresAt !== "lifetime" ? PremiumPlan.expiresAt : 0
    ).format("dddd, MMMM Do YYYY (HH:mm:ss)");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(handler.language, "command.premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(handler.language, "command.premium", "profile_desc", {
          user: String(handler.user?.tag),
          plan: PremiumPlan!.plan,
          expires: PremiumPlan!.expiresAt == "lifetime" ? "lifetime" : expires,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return handler.editReply({ embeds: [embed] });
  }

  owner(client: Manager, handler: CommandHandler) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(handler.language, "command.premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(handler.language, "command.premium", "profile_desc", {
          user: String(handler.user?.tag),
          plan: "dreamvast@owner",
          expires: "lifetime",
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return handler.editReply({ embeds: [embed] });
  }

  admin(client: Manager, handler: CommandHandler) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(handler.language, "command.premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(handler.language, "command.premium", "profile_desc", {
          user: String(handler.user?.tag),
          plan: "dreamvast@admin",
          expires: "lifetime",
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return handler.editReply({ embeds: [embed] });
  }
}
