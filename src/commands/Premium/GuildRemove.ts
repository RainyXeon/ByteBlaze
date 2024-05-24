import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pm", "guild", "remove"];
  public description = "Remove premium from guild!";
  public category = "Premium";
  public accessableby = [Accessableby.Admin];
  public usage = "<id>";
  public aliases = ["pmgr"];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];
  public options = [
    {
      name: "id",
      description: "The guild id you want to remove!",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const id = handler.args[0];

    if (!id)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "command.premium", "guild_remove_no_params")}`
            )
            .setColor(client.color),
        ],
      });

    const db = await client.db.preGuild.get(`${id}`);

    if (!db)
      return handler.editReply({
        content: `${client.i18n.get(handler.language, "command.premium", "guild_remove_404", {
          userid: id as string,
        })}`,
      });

    if (db.isPremium) {
      await client.db.preGuild.delete(`${id}`);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "command.premium", "guild_remove_desc", {
            user: db.redeemedBy.name as string,
          })}`
        )
        .setColor(client.color);
      return handler.editReply({ embeds: [embed] });
    }
    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "command.premium", "guild_remove_already", {
          user: db.redeemedBy.name as string,
        })}`
      )
      .setColor(client.color);
    handler.editReply({ embeds: [embed] });
  }
}
