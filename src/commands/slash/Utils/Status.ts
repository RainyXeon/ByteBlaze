import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  version,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import ms from "pretty-ms";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import os from "os";
import { stripIndents } from "common-tags";

export default class implements SlashCommand {
  name = ["settings", "status"];
  description = "Create bot status channel";
  category = "Utils";
  accessableby = Accessableby.Owner;
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
      const SetupChannel = await client.db.status.get(
        `${interaction.guild!.id}`
      );
      if (SetupChannel !== null && SetupChannel!.enable == true)
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "setup", "status_enable")}`
              )
              .setColor(client.color),
          ],
        });

      const parent = await interaction.guild!.channels.create({
        name: `${client.user!.username} Status`,
        type: ChannelType.GuildCategory,
      });
      const textChannel = await interaction.guild!.channels.create({
        name: "bot-status",
        type: ChannelType.GuildText,
        parent: parent.id,
      });

      const info = this.infoChannelembed(client);

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
        .setDescription(`${client.i18n.get(language, "setup", "status_null")}`)
        .setColor(client.color);

      if (SetupChannel == null)
        return interaction.editReply({
          embeds: [embed_none],
        });

      if (SetupChannel.enable == false)
        return interaction.editReply({
          embeds: [embed_none],
        });

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
