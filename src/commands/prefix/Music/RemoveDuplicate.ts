import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoTrack } from "kazagumo.mod";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";

// Main code
export default class implements PrefixCommand {
  name = "remove-duplicate";
  description = "Remove duplicated song from queue";
  category = "Music";
  usage = "";
  aliases = ["rmd", "rm-dup"];
  lavalink = true;
  accessableby = Accessableby.Member;

  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) {
    const msg = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "pause_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.players.get(message.guild!.id);
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
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
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

    let OriginalQueueLength = player.queue.length;

    for (let i = 0; i < player.queue.length; i++) {
      const element = player.queue[i];
      if (player.queue.current!.uri == element.uri) {
        const track_index = player.queue.indexOf(
          player.queue.current as KazagumoTrack
        );
        player.queue.splice(track_index, 1);
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

    await msg.edit({ embeds: [embed] });

    OriginalQueueLength = 0;
    return;
  }
}
