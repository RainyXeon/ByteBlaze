import { EmbedBuilder, Message } from "discord.js";
import moment from "moment";
import { Manager } from "../../../manager.js";

export default {
  name: "profile",
  description: "View your premium profile!",
  category: "Premium",
  usage: "",
  aliases: [],
  owner: false,
  premium: true,
  lavalink: false,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const PremiumPlan = await client.db.get(
      `premium.user_${message.author.id}`
    );
    const expires = moment(PremiumPlan.expiresAt).format(
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
          plan: PremiumPlan.plan,
          expires: expires,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  },
};
