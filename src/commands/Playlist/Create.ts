import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import id from "voucher-code-generator";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";

export default class implements Command {
  public name = ["pl", "create"];
  public description = "Create a new playlist";
  public category = "Playlist";
  public accessableby = [Accessableby.Member];
  public usage = "<playlist_name> <playlist_description>";
  public aliases = [];
  public lavalink = true;
  public playerCheck = false;
  public usingInteraction = true;
  public sameVoiceCheck = false;
  public permissions = [];

  public options = [
    {
      name: "name",
      description: "The name of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "description",
      description: "The description of the playlist",
      type: ApplicationCommandOptionType.String,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const value = handler.args[0];
    const des = handler.args[1];

    if (value == null || !value)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "invalid")}`)
            .setColor(client.color),
        ],
      });

    if (value.length > 16)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "create_toolong")}`)
            .setColor(client.color),
        ],
      });
    if (des && des.length > 1000)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.playlist", "des_toolong")}`)
            .setColor(client.color),
        ],
      });

    const fullList = await client.db.playlist.all();

    const Limit = fullList.filter((data) => {
      return data.value.owner == handler.user?.id;
    });

    if (Limit.length >= client.config.bot.LIMIT_PLAYLIST) {
      handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.getString(handler.language, "command.playlist", "create_limit_playlist", {
                limit: String(client.config.bot.LIMIT_PLAYLIST),
              })}`
            )
            .setColor(client.color),
        ],
      });
      return;
    }

    const idgen = id.generate({ length: 8, prefix: "playlist-" });

    await client.db.playlist.set(`${idgen}`, {
      id: idgen[0],
      name: value,
      owner: handler.user?.id,
      tracks: [],
      private: true,
      created: Date.now(),
      description: des ? des : null,
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.playlist", "create_created", {
          playlist: String(value),
          id: idgen[0],
        })}`
      )
      .setColor(client.color);
    handler.editReply({ content: " ", embeds: [embed] });
  }
}
