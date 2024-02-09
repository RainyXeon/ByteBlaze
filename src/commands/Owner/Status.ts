import {
  EmbedBuilder,
  ChannelType,
  version,
  Message,
  ApplicationCommandOptionType,
} from "discord.js";
import ms from "pretty-ms";
import os from "os";
import { stripIndents } from "common-tags";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["status"];
  public description = "Create bot status channel";
  public category = "Owner";
  public accessableby = Accessableby.Owner;
  public usage = "<create> or <delete>";
  public aliases = ["status-channel", "sc"];
  public lavalink = false;
  public usingInteraction = true;
  public playerCheck = false;
  public sameVoiceCheck = false;
  public options = [
    {
      name: "type",
      description: "Type of channel",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Create",
          value: "create",
        },
        {
          name: "Delete",
          value: "delete",
        },
      ],
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();
    let option = ["create", "delete"];
    if (!handler.args[0] || !option.includes(handler.args[0]))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "utilities", "arg_error", {
                text: "**create** or **delete**!",
              })}`
            )
            .setColor(client.color),
        ],
      });

    const choose = handler.args[0];

    if (choose === "create") {
      const StatusChannel = await client.db.status.get(`${handler.guild!.id}`);
      if (StatusChannel !== null && StatusChannel!.enable == true)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "setup", "status_enable")}`
              )
              .setColor(client.color),
          ],
        });

      const parent = await handler.guild!.channels.create({
        name: `${client.user!.username} Status`,
        type: ChannelType.GuildCategory,
      });

      const textChannel = await handler.guild!.channels.create({
        name: "bot-status",
        type: ChannelType.GuildText,
        parent: parent.id,
      });

      const info = this.infoChannelembed(client);

      const channel_msg = await textChannel.send({
        content: ``,
        embeds: [info],
      });

      const new_data = {
        guild: handler.guild!.id,
        enable: true,
        channel: textChannel.id,
        statmsg: channel_msg.id,
        category: parent.id,
      };

      await client.db.status.set(`${handler.guild!.id}`, new_data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "setup", "status_create", {
            channel: textChannel.name,
          })}`
        )
        .setColor(client.color);
      return handler.editReply({ embeds: [embed] });
    }

    if (choose === "delete") {
      const StatusChannel = await client.db.status.get(`${handler.guild!.id}`);

      const embed_none = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "setup", "status_null", {
            channel: String(undefined),
          })}`
        )
        .setColor(client.color);

      if (StatusChannel == null)
        return handler.editReply({ embeds: [embed_none] });
      if (StatusChannel!.enable == false)
        return handler.editReply({
          embeds: [embed_none],
        });

      const fetchedTextChannel = handler.guild!.channels.cache.get(
        StatusChannel.channel
      );
      const fetchedCategory = handler.guild!.channels.cache.get(
        StatusChannel.category
      );

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "setup", "status_delete", {
            channel: fetchedTextChannel!.name,
          })}`
        )
        .setColor(client.color);
      await handler.editReply({ embeds: [embed] });

      if (fetchedTextChannel) await fetchedTextChannel.delete();
      if (fetchedCategory) await fetchedCategory.delete();

      const deleted_data = {
        guild: handler.guild!.id,
        enable: false,
        channel: "",
        statmsg: "",
        category: "",
      };

      await client.db.status.set(`${handler.guild!.id}`, deleted_data);
    }
  }

  infoChannelembed(client: Manager) {
    const total = os.totalmem() / 1024 / 1024;
    const used = process.memoryUsage().rss / 1024 / 1024;

    const hostInfo = stripIndents`\`\`\`
    - OS: ${os.type()} ${os.release()} (${os.arch()})
    - CPU: ${os.cpus()[0].model}
    - Uptime: ${ms(client.uptime as number)}
    - RAM: ${(total / 1024).toFixed(2)} GB
    - Memory Usage: ${used.toFixed(2)}/${total.toFixed(2)} (MB)
    - Node.js: ${process.version}
    \`\`\``;

    const botInfo = stripIndents`\`\`\`
    - Codename: ${client.metadata.codename}
    - Bot version: ${client.metadata.version}
    - Autofix version: ${client.metadata.autofix}
    - Discord.js: ${version}
    - WebSocket Ping: ${client.ws.ping}ms
    - Guild Count: ${client.guilds.cache.size}
    - User count: ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
    \`\`\``;

    return new EmbedBuilder()
      .setAuthor({
        name: client.user!.tag + " Status",
        iconURL: String(client.user!.displayAvatarURL({ size: 2048 })),
      })
      .setColor(client.color)
      .addFields(
        { name: "Host info", value: hostInfo },
        { name: "Bot info", value: botInfo }
      )
      .setTimestamp();
  }
}
