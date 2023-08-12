import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: "premium-remove",
  description: "Remove premium from members!",
  category: "Premium",
  owner: true,
  usage: "<mention or id>",
  aliases: ["prm"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    let db;

    const mentions = message.mentions.users.first();

    const id = args[0] && mentions ? undefined : args[0];

    if (!id && !mentions)
      return message.channel.send({
        content: `${client.i18n.get(language, "premium", "remove_no_params")}`,
      });
    if (id && mentions)
      return message.channel.send({
        content: `${client.i18n.get(
          language,
          "premium",
          "remove_only_params",
        )}`,
      });

    if (id && !mentions) db = await client.db.get(`premium.user_${id}`);
    if (mentions && !id)
      db = await client.db.get(`premium.user_${mentions.id}`);

    if (!db)
      return message.channel.send({
        content: `${client.i18n.get(language, "premium", "remove_404", {
          userid: id as string,
        })}`,
      });

    if (db.isPremium) {
      const data = {
        id: id || mentions!.id,
        isPremium: false,
        redeemedAt: null,
        expiresAt: null,
        plan: null,
      };

      await client.db.set(`premium.user_${data.id}`, data);

      await client.premiums.set(id || mentions!.id, data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "premium", "remove_desc", {
            user: mentions?.username as string,
          })}`,
        )
        .setColor(client.color);
      message.channel.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "premium", "remove_already", {
            user: mentions?.username as string,
          })}`,
        )
        .setColor(client.color);

      message.channel.send({ embeds: [embed] });
    }
  },
};
