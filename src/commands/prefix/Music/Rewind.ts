import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { FormatDuration } from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
const rewindNum = 10;

// Main code
export default class implements PrefixCommand {
  name = "rewind";
  description = "Rewind timestamp in the song!";
  category = "Music";
  usage = "<seconds>";
  aliases = [];
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
            `${client.i18n.get(language, "music", "rewind_loading")}`
          )
          .setColor(client.color),
      ],
    });
    const value = args[0];

    if (value && isNaN(+value))
      return msg.edit(
        `${client.i18n.get(language, "music", "number_invalid")}`
      );

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

    const song_position = player.shoukaku.position;
    const CurrentDuration = new FormatDuration().parse(song_position);

    if (value && !isNaN(+value)) {
      if (song_position - Number(value) * 1000 > 0) {
        await player["send"]({
          guildId: message.guild!.id,
          playerOptions: {
            position: song_position - Number(value) * 1000,
          },
        });

        const rewind1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind1] });
      } else {
        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "rewind_beyond")}`
              )
              .setColor(client.color),
          ],
        });
      }
    } else if (value && isNaN(+value)) {
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "rewind_invalid", {
                prefix: prefix,
              })}`
            )
            .setColor(client.color),
        ],
      });
    }

    if (!value) {
      if (song_position - rewindNum * 1000 > 0) {
        await player["send"]({
          guildId: message.guild!.id,
          playerOptions: {
            position: song_position - rewindNum * 1000,
          },
        });

        const rewind2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind2] });
      } else {
        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "rewind_beyond")}`
              )
              .setColor(client.color),
          ],
        });
      }
    }
  }
}
