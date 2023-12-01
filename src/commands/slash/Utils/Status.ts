import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
  ChannelType,
  version,
  CommandInteraction,
  CommandInteractionOptionResolver,
  TextChannel,
} from "discord.js";
import ms from "pretty-ms";
import { Manager } from "../../../manager.js";
import { SetupInfoChannel } from "../../../@types/Setup.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

export default class implements SlashCommand {
  name = ["settings", "status"];
  description = "Create bot status channel";
  category = "Utils";
  accessableby = Accessableby.Manager;
  lavalink = false;
  options = [
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
  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type"
      ) === "create"
    ) {
      const parent = await interaction.guild!.channels.create({
        name: `${client.user!.username} Status`,
        type: ChannelType.GuildCategory,
      });
      const textChannel = await interaction.guild!.channels.create({
        name: "bot-status",
        type: ChannelType.GuildText,
        parent: parent.id,
      });

      const info = new EmbedBuilder()
        .setTitle(client.user!.tag + " Status")
        .addFields([
          {
            name: "Uptime",
            value: `\`\`\`${ms(client.uptime as number)}\`\`\``,
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

      const data = {
        guild: interaction.guild!.id,
        enable: true,
        channel: textChannel.id,
        statmsg: channel_msg.id,
        category: parent.id,
      };
      await client.db.status.set(`${interaction.guild!.id}`, data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_msg", {
            channel: String(textChannel),
          })}`
        )
        .setColor(client.color);
      return interaction.followUp({ embeds: [embed] });
    }

    if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type"
      ) === "delete"
    ) {
      const SetupChannel = await client.db.status.get(
        `${interaction.guild!.id}`
      );

      const embed_none = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: String(undefined),
          })}`
        )
        .setColor(client.color);

      if (!SetupChannel) return interaction.editReply({ embeds: [embed_none] });

      const fetchedTextChannel = interaction.guild!.channels.cache.get(
        SetupChannel.channel
      );
      const fetchedCategory = interaction.guild!.channels.cache.get(
        SetupChannel.category
      );

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: String(fetchedTextChannel),
          })}`
        )
        .setColor(client.color);

      await interaction.editReply({ embeds: [embed] });

      if (fetchedTextChannel) await fetchedTextChannel.delete();
      if (fetchedCategory) await fetchedCategory.delete();

      const deleted_data = {
        guild: interaction.guild!.id,
        enable: false,
        channel: "",
        statmsg: "",
        category: "",
      };

      return client.db.status.set(`${interaction.guild!.id}`, deleted_data);
    }
  }
}
