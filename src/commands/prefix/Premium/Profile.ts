import { EmbedBuilder, Message } from "discord.js";
import moment from "moment";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "profile"
  description = "View your premium profile!"
  category = "Premium"
  accessableby = Accessableby.Premium;
  usage = ""
  aliases = []
  lavalink = false

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const PremiumPlan = await client.db.premium.get(`${message.author.id}`);
    const expires = moment(PremiumPlan!.expiresAt).format(
      "do/MMMM/YYYY (HH:mm:ss)"
    );

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "premium", "profile_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(language, "premium", "profile_desc", {
          user: message.author.tag,
          plan: PremiumPlan!.plan,
          expires: expires,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
