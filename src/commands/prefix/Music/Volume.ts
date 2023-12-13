import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
import { KazagumoPlayer } from "better-kazagumo";

// Main code
export default class implements PrefixCommand {
  name = "volume";
  description = "Adjusts the volume of the bot.";
  category = "Music";
  usage = "<number>";
  aliases = ["vol"];
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
            `${client.i18n.get(language, "music", "volume_loading")}`
          )
          .setColor(client.color),
      ],
    });

    const value = args[0];
    if (value && isNaN(+value))
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "number_invalid")}`
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

    if (!value)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "volume_usage", {
                volume: String(player.volume),
              })}`
            )
            .setColor(client.color),
        ],
      });
    if (Number(value) <= 0 || Number(value) > 100)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "volume_invalid")}`
            )
            .setColor(client.color),
        ],
      });

    await player.setVolume(Number(value));

    this.setVol247(client, player, Number(value));

    const changevol = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "volume_msg", {
          volume: value,
        })}`
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [changevol] });
  }

  async setVol247(client: Manager, player: KazagumoPlayer, vol: number) {
    if (await client.db.autoreconnect.get(player.guildId)) {
      await client.db.autoreconnect.set(`${player.guildId}.config.volume`, vol);
    }
  }
}
