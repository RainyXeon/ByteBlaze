import { ApplicationCommandOptionType, Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { KazagumoPlayer } from "../../lib/main.js";

// Main code
export default class implements Command {
  public name = ["remove"];
  public description = "Remove song from queue.";
  public category = "Music";
  public accessableby = Accessableby.Member;
  public usage = "<position>";
  public aliases = ["rm"];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public options = [
    {
      name: "position",
      description: "The position in queue want to remove.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.manager.players.get(
      handler.guild!.id
    ) as KazagumoPlayer;

    const tracks = handler.args[0];
    if (tracks && isNaN(+tracks))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(handler.language, "music", "number_invalid")}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(tracks) == 0)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "music",
                "removetrack_already"
              )}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(tracks) > player.queue.length)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(
                handler.language,
                "music",
                "removetrack_notfound"
              )}`
            )
            .setColor(client.color),
        ],
      });

    const song = player.queue[Number(tracks) - 1];

    player.queue.splice(Number(tracks) - 1, 1);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(handler.language, "music", "removetrack_desc", {
          name: song.title,
          url: String(song.uri),
          duration: new ConvertTime().parse(player.shoukaku.position),
          request: String(song.requester),
        })}`
      )
      .setColor(client.color);

    return handler.editReply({ embeds: [embed] });
  }
}
