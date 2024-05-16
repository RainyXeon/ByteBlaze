import { ApplicationCommandOptionType, EmbedBuilder, User } from "discord.js";
import moment from "moment";
import { Accessableby, Command } from "../../structures/Command.js";
import { Manager } from "../../manager.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Premium } from "../../database/schema/Premium.js";

export default class implements Command {
  public name = ["pm", "redeem"];
  public description = "Redeem your premium!";
  public category = "Premium";
  public accessableby = [Accessableby.Member];
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
            .setDescription(`${client.getString(handler.language, "command.premium", "redeem_invalid")}`),
        ],
      });

    let member = await client.db.premium.get(`${handler.user?.id}`);

    if (member && member.isPremium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${client.getString(handler.language, "command.premium", "redeem_already")}`);
      return handler.editReply({ embeds: [embed] });
    }

    const premium = await client.db.code.get(`${input.toUpperCase()}`);

    if (!premium) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${client.getString(handler.language, "command.premium", "redeem_invalid")}`);
      return handler.editReply({ embeds: [embed] });
    }

    if (premium.expiresAt !== "lifetime" && premium.expiresAt < Date.now()) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${client.getString(handler.language, "command.premium", "redeem_invalid")}`);
      return handler.editReply({ embeds: [embed] });
    }

    const expires = moment(premium.expiresAt !== "lifetime" ? premium.expiresAt : 0).format("dddd, MMMM Do YYYY");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.getString(handler.language, "command.premium", "redeem_title")}`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setDescription(
        `${client.getString(handler.language, "command.premium", "redeem_desc", {
          expires: premium.expiresAt !== "lifetime" ? expires : "lifetime",
          plan: premium.plan,
        })}`
      )
      .setColor(client.color)
      .setTimestamp();

    const newPreUser = await client.db.premium.set(`${handler.user?.id}`, {
      id: String(handler.user?.id),
      isPremium: true,
      redeemedBy: handler.user!,
      redeemedAt: Date.now(),
      expiresAt: premium.expiresAt,
      plan: premium.plan,
    });
    await handler.editReply({ embeds: [embed] });
    await client.db.code.delete(`${input.toUpperCase()}`);
    await this.sendRedeemLog(client, newPreUser, handler.user);
    return;
  }

  protected async sendRedeemLog(client: Manager, premium: Premium, user?: User | null): Promise<void> {
    if (!client.config.features.PREMIUM_LOG_CHANNEL) return;
    const language = client.config.bot.LANGUAGE;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.getString(language, "event.premium", "title")}`,
      })
      .addFields([
        {
          name: `${client.getString(language, "event.premium", "display_name")}`,
          value: `${user?.displayName}`,
        },
        {
          name: `${client.getString(language, "event.premium", "username")}`,
          value: `${user?.username}`,
        },
        {
          name: "ID",
          value: `${user?.id}`,
        },
        {
          name: `${client.getString(language, "event.premium", "createdAt")}`,
          value: `${moment(user?.createdAt.getTime()).format("dddd, MMMM Do YYYY")}`,
        },
        {
          name: `${client.getString(language, "event.premium", "redeemedAt")}`,
          value: `${moment(premium.redeemedAt).format("dddd, MMMM Do YYYY")}`,
        },
        {
          name: `${client.getString(language, "event.premium", "expiresAt")}`,
          value: `${
            premium.expiresAt == "lifetime" ? "lifetime" : moment(premium.expiresAt).format("dddd, MMMM Do YYYY")
          }`,
        },
        {
          name: `${client.getString(language, "event.premium", "plan")}`,
          value: `${premium.plan}`,
        },
      ])
      .setTimestamp()
      .setColor(client.color);

    try {
      const channel = await client.channels.fetch(client.config.features.PREMIUM_LOG_CHANNEL).catch(() => undefined);
      if (!channel || (channel && !channel.isTextBased())) return;
      channel.messages.channel.send({ embeds: [embed] });
    } catch {}

    return;
  }
}
