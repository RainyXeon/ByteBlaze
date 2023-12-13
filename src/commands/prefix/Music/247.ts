import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
import { KazagumoPlayer } from "better-kazagumo";

export default class implements PrefixCommand {
  name = "247";
  description = "24/7 in voice channel";
  category = "Music";
  usage = "";
  aliases = [];
  accessableby = Accessableby.Member;
  lavalink = true;

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
            `${client.i18n.get(language, "music", "247_loading")}`
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

    let data = await client.db.autoreconnect.get(`${message.guild?.id}`);

    if (data) {
      await client.db.autoreconnect.delete(`${message.guild!.id}`);
      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_off")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [on] });
    } else if (!data) {
      if (!player.queue.current || player.queue.current == null)
        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "noplayer", "no_music")}`
              )
              .setColor(client.color),
          ],
        });

      await client.db.autoreconnect.set(`${message.guild!.id}`, {
        guild: player.guildId,
        text: player.textId,
        voice: player.voiceId,
        current: player.queue.current?.uri,
        config: {
          loop: player.loop,
          volume: player.volume,
        },
        queue: player.queue.length !== 0 ? this.queueUri(player) : [],
      });

      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_on")}`)
        .setColor(client.color);
      return msg.edit({ content: " ", embeds: [on] });
    }
  }

  queueUri(player: KazagumoPlayer) {
    const res = [];
    for (let data of player.queue) {
      res.push(data.uri);
    }
    return res;
  }
}
