import { EmbedBuilder } from "discord.js";
import moment from "moment";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pm", "guild", "profile"];
  public description = "View your guild premium profile!";
  public category = "Premium";
  public accessableby = [Accessableby.GuildPremium];
  public usage = "";
  public aliases = ["pmgp"];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public permissions = [];
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const PremiumPlan = await client.db.preGuild.get(`${handler.guild?.id}`);

    if (!PremiumPlan) {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(handler.language, "error", "no_premium_author")}`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setDescription(`${client.i18n.get(handler.language, "error", "no_guild_premium_desc")}`)
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
        name: `${client.i18n.get(handler.language, "command.premium", "guild_profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(handler.language, "command.premium", "guild_profile_desc", {
          guild: String(handler.guild?.name),
          plan: PremiumPlan!.plan,
          expires: PremiumPlan!.expiresAt == "lifetime" ? "lifetime" : expires,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return handler.editReply({ embeds: [embed] });
  }
}
