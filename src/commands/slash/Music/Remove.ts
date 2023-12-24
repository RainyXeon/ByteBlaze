import {
  EmbedBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  ApplicationCommandOptionType,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { ConvertTime } from "../../../structures/ConvertTime.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";

// Main code
export default class implements SlashCommand {
  name = ["remove"];
  description = "Remove song from queue";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "position",
      description: "The position in queue want to remove.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "removetrack_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember)!.voice;
    if (
      !channel ||
      (interaction.member as GuildMember)!.voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`
            )
            .setColor(client.color),
        ],
      });

    const tracks = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("position");
    if (tracks == 0)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "removetrack_already")}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(tracks) > player.queue.length)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "removetrack_notfound")}`
            )
            .setColor(client.color),
        ],
      });

    const song = player.queue[Number(tracks) - 1];

    player.queue.splice(Number(tracks) - 1, 1);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_desc", {
          name: song.title,
          url: String(song.uri),
          duration: new ConvertTime().parse(song.length as number),
          request: String(song.requester),
        })}`
      )
      .setColor(client.color);

    return interaction.editReply({ embeds: [embed] });
  }
}
