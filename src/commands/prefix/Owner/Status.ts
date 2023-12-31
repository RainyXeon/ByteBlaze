import { EmbedBuilder, ChannelType, version, Message } from "discord.js";
import ms from "pretty-ms";
import os from "os";
import { stripIndents } from "common-tags";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "status-channel";
  description = "Create bot status channel";
  category = "Owner";
  accessableby = Accessableby.Owner;
  aliases = ["sc"];
  usage = "<create or delete>";
  lavalink = false;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    let option = ["create", "delete"];
    if (!args[0] || !option.includes(args[0]))
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "arg_error", {
                text: "(create or delete)",
              })}`
            )
            .setColor(client.color),
        ],
      });

    const choose = args[0];

    if (choose === "create") {
      const StatusChannel = await client.db.status.get(`${message.guild!.id}`);
      if (StatusChannel !== null && StatusChannel!.enable == true)
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "setup", "status_enable")}`
              )
              .setColor(client.color),
          ],
        });

      const parent = await message.guild!.channels.create({
        name: `${client.user!.username} Status`,
        type: ChannelType.GuildCategory,
      });

      const textChannel = await message.guild!.channels.create({
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
        guild: message.guild!.id,
        enable: true,
        channel: textChannel.id,
        statmsg: channel_msg.id,
        category: parent.id,
      };

      await client.db.status.set(`${message.guild!.id}`, new_data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_msg", {
            channel: textChannel.name,
          })}`
        )
        .setColor(client.color);
      return message.reply({ embeds: [embed] });
    }

    if (choose === "delete") {
      const StatusChannel = await client.db.status.get(`${message.guild!.id}`);

      const embed_none = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: String(undefined),
          })}`
        )
        .setColor(client.color);

      if (StatusChannel == null) return message.reply({ embeds: [embed_none] });
      if (StatusChannel!.enable == false)
        return message.reply({
          embeds: [embed_none],
        });

      const fetchedTextChannel = message.guild!.channels.cache.get(
        StatusChannel.channel
      );
      const fetchedCategory = message.guild!.channels.cache.get(
        StatusChannel.category
      );

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: fetchedTextChannel!.name,
          })}`
        )
        .setColor(client.color);
      await message.reply({ embeds: [embed] });

      if (fetchedTextChannel) await fetchedTextChannel.delete();
      if (fetchedCategory) await fetchedCategory.delete();

      const deleted_data = {
        guild: message.guild!.id,
        enable: false,
        channel: "",
        statmsg: "",
        category: "",
      };

      await client.db.status.set(`${message.guild!.id}`, deleted_data);
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
