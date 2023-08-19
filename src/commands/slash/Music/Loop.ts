import {
  EmbedBuilder,
  CommandInteraction,
  GuildMember,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoLoopMode } from "../../../types/Lavalink.js";

export default {
  name: ["loop"],
  description: "Loop song in queue type all/current!",
  category: "Music",
  options: [
    {
      name: "type",
      description: "Type of loop",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Current",
          value: "current",
        },
        {
          name: "Queue",
          value: "queue",
        },
      ],
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "loop_loading")}`,
    );
    const player = client.manager.players.get(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    const mode = (interaction.options as CommandInteractionOptionResolver).get(
      "type",
    )!.value;

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
            `${client.i18n.get(language, "music", "loop_current")}`,
          )
          .setColor(client.color);
        msg.edit({ content: " ", embeds: [looped] });
      } else if (player.loop === "track") {
        await player.setLoop(loop_mode.none as KazagumoLoopMode);
        const looped = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "unloop_current")}`,
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
