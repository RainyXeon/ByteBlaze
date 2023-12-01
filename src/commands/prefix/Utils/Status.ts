import {
  EmbedBuilder,
  ChannelType,
  version,
  Message,
  TextChannel,
} from "discord.js";
import ms from "pretty-ms";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

export default class implements PrefixCommand {
  name = "status-channel";
  description = "Create bot status channel";
  category = "Utils";
  accessableby = Accessableby.Manager;
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
      const parent = await message.guild!.channels.create({
        name: `${client.user!.username} Status`,
        type: ChannelType.GuildCategory,
      });

      const textChannel = await message.guild!.channels.create({
        name: "bot-status",
        type: ChannelType.GuildText,
        parent: parent.id,
      });

      const info = new EmbedBuilder()
        .setTitle(client.user!.tag + " Status")
        .addFields([
          {
            name: "Uptime",
            value: `\`\`\`${ms(client.uptime!)}\`\`\``,
            inline: true,
          },
          {
            name: "WebSocket Ping",
            value: `\`\`\`${client.ws.ping}ms\`\`\``,
            inline: true,
          },
          {
            name: "Memory",
            value: `\`\`\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(
              2
            )} MB RSS\n${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
              2
            )} MB Heap\`\`\``,
            inline: true,
          },
          {
            name: "Guild Count",
            value: `\`\`\`${client.guilds.cache.size} guilds\`\`\``,
            inline: true,
          },
          {
            name: "User Count",
            value: `\`\`\`${client.users.cache.size} users\`\`\``,
            inline: true,
          },
          {
            name: "Node",
            value: `\`\`\`${process.version} on ${process.platform} ${process.arch}\`\`\``,
            inline: true,
          },
          {
            name: "Cached Data",
            value: `\`\`\`${client.users.cache.size} users\n${client.emojis.cache.size} emojis\`\`\``,
            inline: true,
          },
          { name: "Discord.js", value: `\`\`\`${version}\`\`\``, inline: true },
        ])
        .setTimestamp()
        .setColor(client.color);
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
      const SetupChannel = await client.db.status.get(`${message.guild!.id}`);

      const embed_none = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: String(undefined),
          })}`
        )
        .setColor(client.color);

      if (!SetupChannel) return message.reply({ embeds: [embed_none] });

      const fetchedTextChannel = message.guild!.channels.cache.get(
        SetupChannel.channel
      );
      const fetchedCategory = message.guild!.channels.cache.get(
        SetupChannel.category
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
}
