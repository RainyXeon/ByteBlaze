import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoTrack } from "kazagumo.mod";
import {
  Accessableby,
  CommandOptionInterface,
  SlashCommand,
} from "../../../@types/Command.js";

let OriginalQueueLength: null | number;

// Main code
export default class implements SlashCommand {
  name = ["remove-duplicate"];
  description = "Remove duplicated song from queue";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
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

    OriginalQueueLength = player.queue.length;

    for (let i = 0; i < player.queue.length; i++) {
      const element = player.queue[i];
      if (player.queue.current!.uri == element.uri) {
        player.queue.splice(
          player.queue.indexOf(player.queue.current as KazagumoTrack),
          1
        );
      }
    }

    const unique = [...new Map(player.queue.map((m) => [m.uri, m])).values()];

    player.queue.clear();
    player.queue.push(...unique);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_duplicate_desc", {
          original: String(OriginalQueueLength),
          new: String(unique.length),
          removed: String(OriginalQueueLength - unique.length),
        })}`
      )
      .setColor(client.color);

    await interaction.editReply({ embeds: [embed] });

    OriginalQueueLength = null;
    return;
  }
}
