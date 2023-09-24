import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoLoopMode } from "../../../types/Lavalink.js";

export default {
  name: "loop",
  description: "Loop song in queue type all/current!",
  category: "Music",
  usage: "<mode>",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "loop_loading")}`
    );
    const player = client.manager.players.get(message.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    const mode_array = ["none", "track", "queue"];

    const mode = args[0];

    if (mode_array.includes(mode))
      return message.channel.send(
        `${client.i18n.get(language, "music", "loop_invalid", {
          mode: mode_array.join(", "),
        })}`
      );

    const loop_mode = {
      none: "none",
      track: "track",
      queue: "queue",
    };

    if (mode == "current") {
      if (player.loop === "none") {
        await player.setLoop(loop_mode.track as KazagumoLoopMode);
        const looped = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "loop_current")}`
          )
          .setColor(client.color);
        msg.edit({ content: " ", embeds: [looped] });
      } else if (player.loop === "track") {
        await player.setLoop(loop_mode.none as KazagumoLoopMode);
        const looped = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "unloop_current")}`
          )
          .setColor(client.color);
        msg.edit({ content: " ", embeds: [looped] });
      }
    } else if (mode == "queue") {
      if (player.loop === "none") {
        await player.setLoop(loop_mode.queue as KazagumoLoopMode);
        const looped_queue = new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "loop_all")}`)
          .setColor(client.color);
        msg.edit({ content: " ", embeds: [looped_queue] });
      } else if (player.loop === "queue") {
        await player.setLoop(loop_mode.none as KazagumoLoopMode);
        const looped = new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "unloop_all")}`)
          .setColor(client.color);
        msg.edit({ content: " ", embeds: [looped] });
      }
    }
  },
};
