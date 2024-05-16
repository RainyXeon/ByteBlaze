import { EmbedBuilder } from "discord.js";
import moment from "moment";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Premium } from "../../database/schema/Premium.js";

export default class implements Command {
  public name = ["pm", "profile"];
  public description = "View your premium profile!";
  public category = "Premium";
  public accessableby = [Accessableby.Premium];
  public usage = "";
  public aliases = [];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    if (handler.user?.id == client.owner) return this.owner(client, handler);
    if (client.config.bot.ADMIN.includes(handler.user?.id ?? "null")) return this.admin(client, handler);

    const PremiumPlan = (await client.db.premium.get(`${handler.user?.id}`)) as Premium;
    const expires = moment(PremiumPlan && PremiumPlan.expiresAt !== "lifetime" ? PremiumPlan.expiresAt : 0).format(
      "do/MMMM/YYYY (HH:mm:ss)"
    );

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.getString(handler.language, "command.premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.getString(handler.language, "command.premium", "profile_desc", {
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
        name: `${client.getString(handler.language, "command.premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.getString(handler.language, "command.premium", "profile_desc", {
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
        name: `${client.getString(handler.language, "command.premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.getString(handler.language, "command.premium", "profile_desc", {
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
