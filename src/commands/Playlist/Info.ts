import { ApplicationCommandOptionType, EmbedBuilder, Message } from "discord.js";
import humanizeDuration from "humanize-duration";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pl", "info"];
  public description = "Check the playlist infomation";
  public category = "Playlist";
  public accessableby = [Accessableby.Member];
  public usage = "<playlist_id>";
  public aliases = [];
  public lavalink = true;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "id",
      description: "The id of the playlist",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0] ? handler.args[0] : null;

    if (value == null)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
            .setColor(client.color),
        ],
      });

    const info = await client.db.playlist.get(value);

    if (!info)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
            .setColor(client.color),
        ],
      });

    const created = humanizeDuration(Date.now() - Number(info.created), {
      largest: 1,
    });

    const name = await client.users.fetch(info.owner);

    const embed = new EmbedBuilder()
      .setTitle(info.name)
      .addFields([
        {
          name: `${client.getString(handler.language, "command.playlist", "info_owner")}`,
          value: `${name.username}`,
        },
        {
          name: `${client.getString(handler.language, "command.playlist", "info_id")}`,
          value: `${info.id}`,
        },
        {
          name: `${client.getString(handler.language, "command.playlist", "info_des")}`,
          value: `${
            info.description === null || info.description === "null"
              ? client.getString(handler.language, "command.playlist", "no_des")
              : info.description
          }`,
        },
        {
          name: `${client.getString(handler.language, "command.playlist", "info_private")}`,
          value: `${
            info.private
              ? client.getString(handler.language, "command.playlist", "public")
              : client.getString(handler.language, "command.playlist", "private")
          }`,
        },
        {
          name: `${client.getString(handler.language, "command.playlist", "info_created")}`,
          value: `${created}`,
        },
        {
          name: `${client.getString(handler.language, "command.playlist", "info_total")}`,
          value: `${info.tracks!.length}`,
        },
      ])
      .setColor(client.color);
    handler.editReply({ embeds: [embed] });
  }
}
