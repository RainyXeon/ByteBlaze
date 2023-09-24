import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js"
import moment from "moment"
import voucher_codes from "voucher-code-generator"
import { Manager } from "../../../manager.js"

export default {
  name: ["premium", "generate"],
  description: "Generate a premium code!",
  category: "Premium",
  owner: true,
  options: [
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
          value: "Weekly",
        },
        {
          name: "Monthly",
          value: "Monthly",
        },
        {
          name: "Yearly",
          value: "Yearly",
        },
      ],
    },
    {
      name: "amount",
      description: "The song link or name",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false })

    const name = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("plan")
    const camount = (
      interaction.options as CommandInteractionOptionResolver
    ).getNumber("amount")

    let codes = []

    const plan = name
    const plans = ["daily", "weekly", "monthly", "yearly"]

    let time
    if (plan === "daily") time = Date.now() + 86400000
    if (plan === "weekly") time = Date.now() + 86400000 * 7
    if (plan === "monthly") time = Date.now() + 86400000 * 30
    if (plan === "yearly") time = Date.now() + 86400000 * 365

    let amount = camount
    if (!amount) amount = 1

    for (var i = 0; i < amount; i++) {
      const codePremium = voucher_codes.generate({
        pattern: "#############-#########-######",
      })

      const code = codePremium.toString().toUpperCase()
      const find = await client.db.get(`code.pmc_${code}`)

      if (!find) {
        await client.db.set(`code.pmc_${code}`, {
          code: code,
          plan: plan,
          expiresAt: time,
        })
        codes.push(`${i + 1} - ${code}`)
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
          plan: String(plan),
          expires: moment(time).format("dddd, MMMM Do YYYY"),
        })}`
      )
      .setTimestamp()
      .setFooter({
        text: `${client.i18n.get(language, "premium", "gen_footer", {
          prefix: "/",
        })}`,
        iconURL: interaction.user.displayAvatarURL(),
      })

    interaction.editReply({ embeds: [embed] })
  },
}
