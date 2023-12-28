import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoLoop } from "../../../@types/Lavalink.js";
import { Accessableby, PrefixCommand } from "../../../@types/Command.js";
import { KazagumoPlayer } from "kazagumo.mod";
import { AutoReconnectBuilder } from "../../../database/build/AutoReconnect.js";

export default class implements PrefixCommand {
  name = "loop";
  description = "Loop song in queue type all/current!";
  category = "Music";
  usage = "<mode>";
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
            `${client.i18n.get(language, "music", "loop_loading")}`
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

    const mode_array = ["none", "song", "queue"];

    const mode = args[0];

    if (!mode_array.includes(mode))
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "loop_invalid", {
                mode: this.changeBold(mode_array).join(", "),
              })}`
            )
            .setColor(client.color),
        ],
      });

    if (mode == "song") {
      await player.setLoop(KazagumoLoop.track);
      this.setLoop247(client, player, String(KazagumoLoop.track));

      const looped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loop_current")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped] });
    } else if (mode == "queue") {
      await player.setLoop(KazagumoLoop.queue);
      this.setLoop247(client, player, String(KazagumoLoop.queue));

      const looped_queue = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loop_all")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped_queue] });
    } else if (mode === "none") {
      await player.setLoop(KazagumoLoop.none);
      this.setLoop247(client, player, String(KazagumoLoop.none));

      const looped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "unloop_all")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped] });
    }
  }

  async setLoop247(client: Manager, player: KazagumoPlayer, loop: string) {
    const data = await new AutoReconnectBuilder(client, player).execute(
      player.guildId
    );
    if (data) {
      await client.db.autoreconnect.set(`${player.guildId}.config.loop`, loop);
    }
  }

  changeBold(arrayMode: string[]) {
    const res = [];
    for (const data of arrayMode) {
      res.push(`**${data}**`);
    }
    return res;
  }
}
