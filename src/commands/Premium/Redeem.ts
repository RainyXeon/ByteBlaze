import { ApplicationCommandOptionType, EmbedBuilder, User } from "discord.js";
import moment from "moment";
import { Accessableby, Command } from "../../structures/Command.js";
import { Manager } from "../../manager.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Premium } from "../../database/schema/Premium.js";

export default class implements Command {
  public name = ["pm-redeem"];
  public description = "Redeem your premium!";
  public category = "Premium";
  public accessableby = Accessableby.Member;
  public usage = "<input>";
  public aliases = [];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "code",
      description: "The code you want to redeem",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    const input = handler.args[0];

    if (!input)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "command.premium",
                "redeem_invalid"
              )}`
            ),
        ],
      });

    let member = await client.db.premium.get(`${handler.user?.id}`);

    if (member && member.isPremium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(handler.language, "command.premium", "redeem_already")}`
        );
      return handler.editReply({ embeds: [embed] });
    }

    const premium = await client.db.code.get(`${input.toUpperCase()}`);

    if (!premium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(handler.language, "command.premium", "redeem_invalid")}`
        );
      return handler.editReply({ embeds: [embed] });
    }

    if (premium.expiresAt < Date.now()) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(handler.language, "command.premium", "redeem_invalid")}`
        );
      return handler.editReply({ embeds: [embed] });
    }

    const expires = moment(premium.expiresAt).format("dddd, MMMM Do YYYY");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(handler.language, "command.premium", "redeem_title")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.i18n.get(handler.language, "command.premium", "redeem_desc", {
          expires: expires,
          plan: premium.plan,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    const new_data = {
      id: String(handler.user?.id),
      isPremium: true,
      redeemedBy: handler.user!,
      redeemedAt: Date.now(),
      expiresAt: premium.expiresAt,
      plan: premium.plan,
    };
    const newPreUser = await client.db.premium.set(`${new_data.id}`, new_data);
    await handler.editReply({ embeds: [embed] });
    await client.db.code.delete(`${input.toUpperCase()}`);
    client.premiums.set(String(handler.user?.id), new_data);
    await this.sendRedeemLog(client, newPreUser, handler.user);
    return;
  }

  protected async sendRedeemLog(
    client: Manager,
    premium: Premium,
    user?: User | null
  ): Promise<void> {
    if (!client.config.features.PREMIUM_LOG_CHANNEL) return;
    const language = client.config.bot.LANGUAGE;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "event.premium", "title")}`,
      })
      .addFields([
        {
          name: `${client.i18n.get(language, "event.premium", "display_name")}`,
          value: `${user?.displayName}`,
        },
        {
          name: `${client.i18n.get(language, "event.premium", "username")}`,
          value: `${user?.username}`,
        },
        {
          name: "ID",
          value: `${user?.id}`,
        },
        {
          name: `${client.i18n.get(language, "event.premium", "createdAt")}`,
          value: `${moment(user?.createdAt.getTime()).format("dddd, MMMM Do YYYY")}`,
        },
        {
          name: `${client.i18n.get(language, "event.premium", "redeemedAt")}`,
          value: `${moment(premium.redeemedAt).format("dddd, MMMM Do YYYY")}`,
        },
        {
          name: `${client.i18n.get(language, "event.premium", "expiresAt")}`,
          value: `${moment(premium.expiresAt).format("dddd, MMMM Do YYYY")}`,
        },
        {
          name: `${client.i18n.get(language, "event.premium", "plan")}`,
          value: `${premium.plan}`,
        },
      ])
      .setTimestamp()
      .setColor(client.color);

    try {
      const channel = await client.channels.fetch(
        client.config.features.PREMIUM_LOG_CHANNEL
      );
      if (!channel || (channel && !channel.isTextBased())) return;
      channel.messages.channel.send({ embeds: [embed] });
    } catch {}

    return;
  }
}
