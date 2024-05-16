import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pm", "remove"];
  public description = "Remove premium from members!";
  public category = "Premium";
  public accessableby = [Accessableby.Admin];
  public usage = "<id>";
  public aliases = ["prm"];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "id",
      description: "The user id you want to remove!",
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
            .setDescription(`${client.getString(handler.language, "command.premium", "remove_no_params")}`)
            .setColor(client.color),
        ],
      });

    const db = await client.db.premium.get(`${id}`);

    if (!db)
      return handler.editReply({
        content: `${client.getString(handler.language, "command.premium", "remove_404", {
          userid: id as string,
        })}`,
      });

    if (db.isPremium) {
      await client.db.premium.delete(`${id}`);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.premium", "remove_desc", {
            user: db.redeemedBy?.username as string,
          })}`
        )
        .setColor(client.color);
      handler.editReply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.getString(handler.language, "command.premium", "remove_already", {
            user: db.redeemedBy?.username as string,
          })}`
        )
        .setColor(client.color);

      handler.editReply({ embeds: [embed] });
    }
  }
}
