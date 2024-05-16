import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import moment from "moment";
import voucher_codes from "voucher-code-generator";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Manager } from "../../manager.js";

export default class implements Command {
  public name = ["pm", "generate"];
  public description = "Generate a premium code!";
  public category = "Premium";
  public accessableby = [Accessableby.Admin];
  public usage = "<type> <number>";
  public aliases = [];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "plan",
      description: "Avalible: daily, weekly, monthly, yearly",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Daily",
          value: "daily",
        },
        {
          name: "Weekly",
          value: "weekly",
        },
        {
          name: "Monthly",
          value: "monthly",
        },
        {
          name: "Yearly",
          value: "yearly",
        },
        {
          name: "Lifetime",
          value: "lifetime",
        },
      ],
    },
    {
      name: "amount",
      description: "The song link or name",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const plans = ["daily", "weekly", "monthly", "yearly", "lifetime"];

    const name = handler.args[0];
    const camount = Number(handler.args[1]);

    if (!name || !plans.includes(name))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.getString(handler.language, "error", "arg_error", {
                text: "**daily**, **weekly**, **monthly**, **yearly**, **lifetime**!",
              })}`
            )
            .setColor(client.color),
        ],
      });
    if (!camount)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.getString(handler.language, "error", "arg_error", {
                text: "**Number**!",
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
    if (plan === "lifetime") time = "lifetime";

    let amount = camount;
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
        });
        codes.push(`${i + 1} - ${code}`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setAuthor({
        name: `${client.getString(handler.language, "command.premium", "gen_author")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.getString(handler.language, "command.premium", "gen_desc", {
          codes_length: String(codes.length),
          codes: codes.join("\n"),
          plan: String(plan),
          expires: time == "lifetime" ? "lifetime" : moment(time).format("dddd, MMMM Do YYYY"),
        })}`
      )
      .setTimestamp()
      .setFooter({
        text: `${client.getString(handler.language, "command.premium", "gen_footer", {
          prefix: "/",
        })}`,
        iconURL: handler.user?.displayAvatarURL(),
      });

    handler.editReply({ embeds: [embed] });
  }
}
