import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
  ChannelType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["setup"];
  public description = "Setup channel song request";
  public category = "Utils";
  public accessableby = Accessableby.Manager;
  public usage = "<create> or <delete>";
  public aliases = ["setup"];
  public lavalink = false;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
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

    const value = handler.args[0];

    if (value === "create") {
      const SetupChannel = await client.db.setup.get(`${handler.guild!.id}`);

      if (SetupChannel && SetupChannel!.enable == true)
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "setup", "setup_enable")}`
              )
              .setColor(client.color),
          ],
        });

      const parent = await handler.guild!.channels.create({
        name: `${client.user!.username}'s Music`,
        type: ChannelType.GuildCategory,
      });
      const textChannel = await handler.guild!.channels.create({
        name: "song-request",
        type: ChannelType.GuildText,
        topic: `${client.i18n.get(handler.language, "setup", "setup_topic")}`,
        parent: parent.id,
      });
      const queueMsg = `${client.i18n.get(
        handler.language,
        "setup",
        "setup_queuemsg"
      )}`;

      const playEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(
            handler.language,
            "setup",
            "setup_playembed_author"
          )}`,
        })
        .setImage(
          `https://cdn.discordapp.com/avatars/${client.user!.id}/${
            client.user!.avatar
          }.jpeg?size=300`
        );

      const channel_msg = await textChannel.send({
        content: `${queueMsg}`,
        embeds: [playEmbed],
        components: [client.diSwitch],
      });

      const voiceChannel = await handler.guild!.channels.create({
        name: `${client.user!.username}`,
        type: ChannelType.GuildVoice,
        parent: parent.id,
        userLimit: 99,
      });

      const new_data = {
        guild: handler.guild!.id,
        enable: true,
        channel: textChannel.id,
        playmsg: channel_msg.id,
        voice: voiceChannel.id,
        category: parent.id,
      };

      await client.db.setup.set(`${handler.guild!.id}`, new_data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "setup", "setup_msg", {
            channel: String(textChannel),
          })}`
        )
        .setColor(client.color);
      return handler.followUp({ embeds: [embed] });
    } else if (value === "delete") {
      const SetupChannel = await client.db.setup.get(`${handler.guild!.id}`);

      const embed_none = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "setup", "setup_null")}`
        )
        .setColor(client.color);

      if (SetupChannel == null)
        return handler.editReply({ embeds: [embed_none] });
      if (SetupChannel.enable == false)
        return handler.editReply({ embeds: [embed_none] });

      const fetchedTextChannel = SetupChannel.channel
        ? handler.guild!.channels.cache.get(SetupChannel.channel)
        : undefined;
      const fetchedVoiceChannel = SetupChannel.voice
        ? handler.guild!.channels.cache.get(SetupChannel.voice)
        : undefined;
      const fetchedCategory = SetupChannel.category
        ? handler.guild!.channels.cache.get(SetupChannel.category)
        : undefined;

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(handler.language, "setup", "setup_deleted", {
            channel: String(fetchedTextChannel),
          })}`
        )
        .setColor(client.color);

      if (fetchedCategory) await fetchedCategory.delete();
      if (fetchedVoiceChannel) await fetchedVoiceChannel.delete();
      if (fetchedTextChannel) await fetchedTextChannel.delete();

      await client.db.setup.delete(`${handler.guild!.id}`);

      if (!fetchedCategory || !fetchedTextChannel || !fetchedVoiceChannel) {
        return handler.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(handler.language, "setup", "setup_null")}`
              )
              .setColor(client.color),
          ],
        });
      }

      return handler.editReply({ embeds: [embed] });
    }
  }
}
