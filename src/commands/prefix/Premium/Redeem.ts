import { EmbedBuilder, Message } from "discord.js";
import moment from "moment";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "redeem";
  description = "Redeem your premium!";
  category = "Premium";
  accessableby = Accessableby.Member;
  usage = "<input>";
  aliases = [];
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const input = args[0];

    if (!input)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
              `${client.i18n.get(language, "premium", "redeem_invalid")}`
            ),
        ],
      });

    let member = await client.db.premium.get(`${message.author.id}`);

    if (member && member.isPremium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_already")}`
        );
      return message.reply({ embeds: [embed] });
    }

    const premium = await client.db.code.get(`${input.toUpperCase()}`);
    if (premium) {
      const expires = moment(premium.expiresAt).format(
        "do/MMMM/YYYY (HH:mm:ss)"
      );
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "premium", "redeem_title")}`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_desc", {
            expires: expires,
            plan: premium.plan,
          })}`
        )
        .setColor(client.color)
        .setTimestamp();

      const new_data = {
        id: message.author.id,
        isPremium: true,
        redeemedBy: message.author,
        redeemedAt: Date.now(),
        expiresAt: premium.expiresAt,
        plan: premium.plan,
      };
      await client.db.premium.set(`${new_data.id}`, new_data);
      await message.reply({ embeds: [embed] });
      await client.db.code.delete(`${input.toUpperCase()}`);
      return client.premiums.set(String(message.author.id), new_data);
    } else {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "premium", "redeem_invalid")}`
        );
      return message.reply({ embeds: [embed] });
    }
  }
}
