import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "premium-remove";
  description = "Remove premium from members!";
  category = "Premium";
  accessableby = Accessableby.Owner;
  usage = "<mention or id>";
  aliases = ["prm"];
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    let db;

    const mentions = message.mentions.users.first();

    const id = args[0] && mentions ? undefined : args[0];

    if (!id && !mentions)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "premium", "remove_no_params")}`
            )
            .setColor(client.color),
        ],
      });
    if (id && mentions)
      return message.reply({
        content: `${client.i18n.get(
          language,
          "premium",
          "remove_only_params"
        )}`,
      });

    if (id && !mentions) db = await client.db.premium.get(`${id}`);
    if (mentions && !id) db = await client.db.premium.get(`${mentions.id}`);

    if (!db)
      return message.reply({
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

      await client.db.premium.set(`${data.id}`, data);

      await client.premiums.set(id || mentions!.id, data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "premium", "remove_desc", {
            user: mentions?.username as string,
          })}`
        )
        .setColor(client.color);
      message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "premium", "remove_already", {
            user: mentions?.username as string,
          })}`
        )
        .setColor(client.color);

      message.reply({ embeds: [embed] });
    }
  }
}
