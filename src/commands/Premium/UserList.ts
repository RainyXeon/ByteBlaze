import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Page } from "../../structures/Page.js";
import { Premium } from "../../database/schema/Premium.js";

export default class implements Command {
  public name = ["pm", "list"];
  public description = "View all existing premium user!";
  public category = "Premium";
  public accessableby = [Accessableby.Admin];
  public usage = "";
  public aliases = ["pml"];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public permissions = [];
  public options = [
    {
      name: "page",
      description: "Page number to show.",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0];

    if (value && isNaN(+value))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.i18n.get(handler.language, "error", "number_invalid")}`)
            .setColor(client.color),
        ],
      });

    const users = Array.from(await client.db.premium.all<Premium>()).map((data) => data.value);
    let pagesNum = Math.ceil(users.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const userStrings = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      userStrings.push(`\`${i + 1}. ${user.redeemedBy.username}/${user.id} - ${user.plan}\``);
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = userStrings.slice(i * 10, i * 10 + 10).join("\n");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(handler.language, "command.premium", "list_title")}`,
        })
        .setColor(client.color)
        .setDescription(str == "" ? "  Nothing" : "\n" + str)
        .setFooter({
          text: `${String(i + 1)}/${String(pagesNum)}`,
        });

      pages.push(embed);
    }

    if (!value) {
      if (pages.length == pagesNum && users.length > 10) {
        if (handler.message) {
          await new Page(client, pages, 60000, handler.language).prefixPage(handler.message);
        } else if (handler.interaction) {
          await new Page(client, pages, 60000, handler.language).slashPage(handler.interaction);
        } else return;
      } else return handler.editReply({ embeds: [pages[0]] });
    } else {
      if (isNaN(+value))
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "command.premium", "list_notnumber")}`
              )
              .setColor(client.color),
          ],
        });
      if (Number(value) > pagesNum)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "command.premium", "list_page_notfound", {
                  page: String(pagesNum),
                })}`
              )
              .setColor(client.color),
          ],
        });
      const pageNum = Number(value) == 0 ? 1 : Number(value) - 1;
      return handler.editReply({ embeds: [pages[pageNum]] });
    }
  }
}
