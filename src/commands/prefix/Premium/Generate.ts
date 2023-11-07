import { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import moment from "moment";
import voucher_codes from "voucher-code-generator";
import { Manager } from "../../../manager.js";

export default {
  name: "premium-generate",
  description: "Generate a premium code!",
  category: "Premium",
  usage: "<type> <number>",
  aliases: ["pg"],
  owner: true,
  premium: false,
  lavalink: false,
  isManager: false,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const plans = ["daily", "weekly", "monthly", "yearly"];

    const name = args[0];
    const camount = args[1];

    if (!name || !plans.includes(name))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "arg_error", {
                text: plans.join(", "),
              })}`
            )
            .setColor(client.color),
        ],
      });
    if (!camount)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "arg_error", {
                text: "number",
              })}`
            )
            .setColor(client.color),
        ],
      });

    let codes = [];

    const plan = name;

    let time;
    if (plan === "daily") time = Date.now() + 86400000;
    if (plan === "weekly") time = Date.now() + 86400000 * 7;
    if (plan === "monthly") time = Date.now() + 86400000 * 30;
    if (plan === "yearly") time = Date.now() + 86400000 * 365;

    let amount = Number(camount);
    if (!amount) amount = 1;

    for (var i = 0; i < amount; i++) {
      const codePremium = voucher_codes.generate({
        pattern: "#############-#########-######",
      });

      const code = codePremium.toString().toUpperCase();
      const find = await client.db.code.get(`${code}`);

      if (!find) {
        await client.db.code.set(`${code}`, {
          code: code,
          plan: plan,
          expiresAt: time,
        }),
          codes.push(`${i + 1} - ${code}`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setAuthor({
        name: `${client.i18n.get(language, "premium", "gen_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      }) //${lang.description.replace("{codes_length}", codes.length).replace("{codes}", codes.join('\n')).replace("{plan}", plan).replace("{expires}", moment(time).format('dddd, MMMM Do YYYY'))}
      .setDescription(
        `${client.i18n.get(language, "premium", "gen_desc", {
          codes_length: String(codes.length),
          codes: codes.join("\n"),
          plan: plan,
          expires: moment(time).format("dddd, MMMM Do YYYY"),
        })}`
      )
      .setTimestamp()
      .setFooter({
        text: `${client.i18n.get(language, "premium", "gen_footer", {
          prefix: prefix,
        })}`,
        iconURL: message.author.displayAvatarURL(),
      });

    message.reply({ embeds: [embed] });
  },
};
