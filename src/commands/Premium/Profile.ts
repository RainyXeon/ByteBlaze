import { CommandInteraction, EmbedBuilder } from "discord.js";
import moment from "moment";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pm-profile"];
  public description = "View your premium profile!";
  public category = "Premium";
  public accessableby = Accessableby.Premium;
  public usage = "";
  public aliases = [];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public options = [];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const PremiumPlan = await client.db.premium.get(`${handler.user?.id}`);
    const expires = moment(PremiumPlan!.expiresAt).format(
      "do/MMMM/YYYY (HH:mm:ss)"
    );

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(
          handler.language,
          "premium",
          "profile_author"
        )}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(handler.language, "premium", "profile_desc", {
          user: String(handler.user?.tag),
          plan: PremiumPlan!.plan,
          expires: expires,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return handler.editReply({ embeds: [embed] });
  }
}
