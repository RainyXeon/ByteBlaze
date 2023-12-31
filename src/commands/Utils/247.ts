import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  Message,
} from "discord.js";
import { Manager } from "../../manager.js";
import { AutoReconnectBuilder } from "../../database/build/AutoReconnect.js";
import { Accessableby, Command } from "../../@base/Command.js";
import { CommandHandler } from "../../@base/CommandHandler.js";

export default class implements Command {
  public name = ["247"];
  public description = "24/7 in voice channel";
  public category = "Utils";
  public accessableby = Accessableby.Manager;
  public usage = "<enable> or <disable>";
  public aliases = [];
  public lavalink = true;
  public usingInteraction = true;
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
  public playerCheck = false;

  async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(handler.guild!.id);

    const value = handler.args[0];

    const data = await new AutoReconnectBuilder(client, player).execute(
      handler.guild?.id!
    );

    if (value == "disable") {
      if (!data.twentyfourseven) {
        const offAl = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(handler.language, "music", "247_off_already")}`
          )
          .setColor(client.color);
        return handler.editReply({ content: " ", embeds: [offAl] });
      }

      data.current || data.current.length !== 0
        ? await client.db.autoreconnect.set(
            `${handler.guild!.id}.twentyfourseven`,
            false
          )
        : await client.db.autoreconnect.delete(`${handler.guild!.id}`);

      player && player.voiceId && handler.member!.voice.channel == null
        ? player.destroy()
        : true;

      const on = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "music", "247_off")}`
        )
        .setColor(client.color);
      handler.editReply({ content: " ", embeds: [on] });
    } else if (value == "enable") {
      const { channel } = handler.member!.voice;
      if (!channel || handler.member!.voice.channel == null)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(
                  handler.language,
                  "noplayer",
                  "no_voice_247"
                )}`
              )
              .setColor(client.color),
          ],
        });

      if (data.twentyfourseven) {
        const onAl = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(handler.language, "music", "247_on_already")}`
          )
          .setColor(client.color);
        return handler.editReply({ content: " ", embeds: [onAl] });
      }

      if (!player)
        await client.manager.createPlayer({
          guildId: handler.guild!.id,
          voiceId: handler.member!.voice.channel!.id,
          textId: String(handler.channel?.id),
          deaf: true,
        });

      await client.db.autoreconnect.set(
        `${handler.guild!.id}.twentyfourseven`,
        true
      );
      const on = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "music", "247_on")}`
        )
        .setColor(client.color);
      return handler.editReply({ content: " ", embeds: [on] });
    } else {
      const onsome = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "error", "wrong_args", {
            args: this.usage,
          })}`
        )
        .setColor(client.color);
      return handler.editReply({ content: " ", embeds: [onsome] });
    }
  }
}
