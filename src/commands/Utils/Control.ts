import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import { Manager } from "../../manager.js";
import { ControlEnum } from "../../database/schema/Control.js";
import { Accessableby, Command } from "../../@base/Command.js";
import { CommandHandler } from "../../@base/CommandHandler.js";

export default class implements Command {
  public name = ["settings", "control"];
  public description = "Enable or disable the player control";
  public category = "Utils";
  public accessableby = Accessableby.Manager;
  public usage = "<enable> or <disable>";
  public aliases = ["control", "setcontrol"];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public options = [
    {
      name: "type",
      description: "Choose enable or disable",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Enable",
          value: "enable",
        },
        {
          name: "Disable",
          value: "disable",
        },
      ],
    },
  ];

  async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0];
    if (value === "enable") {
      await client.db.control.set(`${handler.guild!.id}`, ControlEnum.Enable);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "utilities", "control_set", {
            toggle: `${client.i18n.get(handler.language, "music", "enabled")}`,
          })}`
        )
        .setColor(client.color);

      return handler.editReply({ embeds: [embed] });
    } else if (value === "disable") {
      await client.db.control.set(`${handler.guild!.id}`, ControlEnum.Disable);
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "utilities", "control_set", {
            toggle: `${client.i18n.get(handler.language, "music", "disabled")}`,
          })}`
        )
        .setColor(client.color);

      return handler.editReply({ embeds: [embed] });
    } else {
      const onsome = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "utilities", "arg_error", {
            text: this.usage,
          })}`
        )
        .setColor(client.color);
      return handler.editReply({ content: " ", embeds: [onsome] });
    }
  }
}
