import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
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
  public aliases = ["pmg"];
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
      description: "The amount of code you want to generate",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const plans = this.options[0].choices!.map((data) => data.value);
    const name = handler.args[0];
    const camount = Number(handler.args[1]);

    if (!name || !plans.includes(name))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "error", "arg_error", {
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
              `${client.i18n.get(handler.language, "error", "arg_error", {
                text: "**Number**!",
              })}`
            )
            .setColor(client.color),
        ],
      });

    let codes = [];

    const plan = name;

    let time;
    switch (plan) {
      case "daily":
        time = Date.now() + 86400000;
        break;
      case "weekly":
        time = Date.now() + 86400000 * 7;
        break;
      case "monthly":
        time = Date.now() + 86400000 * 30;
        break;
      case "yearly":
        time = Date.now() + 86400000 * 365;
        break;
      case "lifetime":
        time = "lifetime";
        break;
    }

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
        name: `${client.i18n.get(handler.language, "command.premium", "gen_author")}`,
      })
      .setDescription(
        `${client.i18n.get(handler.language, "command.premium", "gen_desc", {
          codes_length: String(codes.length),
          codes: codes.join("\n"),
          plan: String(plan),
          expires: time == "lifetime" ? "lifetime" : `<t:${(time / 1000 ?? 0).toFixed()}:F>`,
        })}`
      )
      .setTimestamp()
      .setFooter({
        text: `${client.i18n.get(handler.language, "command.premium", "gen_footer", {
          prefix: "/",
        })}`,
        iconURL: handler.user?.displayAvatarURL(),
      });

    const embedMes = (pass) =>
      new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(
            handler.language,
            "command.premium",
            pass ? "gen_success" : "gen_failed"
          )}`
        )
        .setColor(client.color);

    const getDM = await handler.user.createDM(true);
    if (!getDM) return handler.editReply({ embeds: [embedMes(false)] });
    if (!getDM.isDMBased()) return handler.editReply({ embeds: [embedMes(false)] });
    await getDM.send({ embeds: [embed] });
    await handler.editReply({ embeds: [embedMes(true)] });
  }
}
