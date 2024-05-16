import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Accessableby, Command } from "../../structures/Command.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { ConvertTime } from "../../utilities/ConvertTime.js";
import { AutocompleteInteractionChoices, GlobalInteraction } from "../../@types/Interaction.js";
import { RainlinkPlayer, RainlinkTrack } from "../../rainlink/main.js";

// Main code
export default class implements Command {
  public name = ["insert"];
  public description = "Insert a song into a specific position in queue.";
  public category = "Music";
  public accessableby = [Accessableby.Member];
  public usage = "";
  public aliases = [];
  public lavalink = true;
  public playerCheck = true;
  public usingInteraction = true;
  public sameVoiceCheck = true;
  public permissions = [];
  public options = [
    {
      name: "position",
      description: "The position in queue want to remove.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "search",
      description: "The song link or name",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply();

    const player = client.rainlink.players.get(handler.guild!.id) as RainlinkPlayer;

    const position = Number(handler.args[0]);
    handler.args.splice(0, 1);
    const song = handler.args.join(" ");
    if (position && isNaN(+position))
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "error", "number_invalid")}`)
            .setColor(client.color),
        ],
      });
    if (Number(position) == 0)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "insert_already")}`)
            .setColor(client.color),
        ],
      });
    if (Number(position) > player.queue.length)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "insert_notfound")}`)
            .setColor(client.color),
        ],
      });

    const result = await player.search(song, { requester: handler.user });
    const track = result.tracks[0];

    if (!result.tracks.length)
      return handler.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${client.getString(handler.language, "command.music", "insert_notfound")}`)
            .setColor(client.color),
        ],
      });

    player.queue.splice(position - 1, 0, track);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.getString(handler.language, "command.music", "insert_desc", {
          name: this.getTitle(client, track),
          duration: new ConvertTime().parse(player.position),
          request: String(track.requester),
        })}`
      )
      .setColor(client.color);

    client.wsl.get(handler.guild!.id)?.send({
      op: "playerQueueInsert",
      guild: handler.guild!.id,
      track: {
        title: track.title,
        uri: track.uri,
        length: track.duration,
        thumbnail: track.artworkUrl,
        author: track.author,
        requester: track.requester
          ? {
              id: (track.requester as any).id,
              username: (track.requester as any).username,
              globalName: (track.requester as any).globalName,
              defaultAvatarURL: (track.requester as any).defaultAvatarURL ?? null,
            }
          : null,
      },
      index: position - 1,
    });

    return handler.editReply({ embeds: [embed] });
  }

  getTitle(client: Manager, tracks: RainlinkTrack): string {
    if (client.config.lavalink.AVOID_SUSPEND) return tracks.title;
    else {
      return `[${tracks.title}](${tracks.uri})`;
    }
  }

  // Autocomplete function
  async autocomplete(client: Manager, interaction: GlobalInteraction, language: string) {
    let choice: AutocompleteInteractionChoices[] = [];
    const url = String((interaction as CommandInteraction).options.get("search")!.value);

    const Random =
      client.config.lavalink.AUTOCOMPLETE_SEARCH[
        Math.floor(Math.random() * client.config.lavalink.AUTOCOMPLETE_SEARCH.length)
      ];

    const match = client.REGEX.some((match) => {
      return match.test(url) == true;
    });

    if (match == true) {
      choice.push({ name: url, value: url });
      await (interaction as AutocompleteInteraction).respond(choice).catch(() => {});
      return;
    }

    if (client.lavalinkUsing.length == 0) {
      choice.push({
        name: `${client.getString(language, "command.music", "no_node")}`,
        value: `${client.getString(language, "command.music", "no_node")}`,
      });
      return;
    }
    const searchRes = await client.rainlink.search(url || Random);

    if (searchRes.tracks.length == 0 || !searchRes.tracks) {
      return choice.push({ name: "Error song not matches", value: url });
    }

    for (let i = 0; i < 10; i++) {
      const x = searchRes.tracks[i];
      choice.push({
        name: x && x.title ? x.title : "Unknown track name",
        value: x && x.uri ? x.uri : url,
      });
    }

    await (interaction as AutocompleteInteraction).respond(choice).catch(() => {});
  }
}
