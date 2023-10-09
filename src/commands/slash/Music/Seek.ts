import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const time_regex = /(^[0-9][\d]{0,3}):(0[0-9]{1}$|[1-5]{1}[0-9])/;

// Main code
export default {
  name: ["seek"],
  description: "Seek timestamp in the song!",
  category: "Music",
  owner: false,
  premium: false,
  lavalink: true,
  isManager: false,
  options: [
    {
      name: "time",
      description:
        "Set the position of the playing track. Example: 0:10 or 120:10",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    let value;
    const time = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("time");

    console.log(time_regex.test(time!), time!.split(/:/));
    if (!time_regex.test(time!))
      return interaction.editReply(
        `${client.i18n.get(language, "music", "seek_invalid")}`
      );
    else {
      const [m, s] = time!.split(/:/);
      const min = Number(m) * 60;
      const sec = Number(s);
      value = min + sec;
      console.log(value);
    }

    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "seek_loading")}`
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

    if (value * 1000 >= player.queue.current!.length! || value < 0)
      return msg.edit(`${client.i18n.get(language, "music", "seek_beyond")}`);
    await player.seek(value * 1000);

    const song_position = player.shoukaku.position;

    let final_res;

    if (song_position < value * 1000) final_res = song_position + value * 1000;
    else final_res = value * 1000;

    console.log(final_res / 1000);

    const Duration = formatDuration(final_res);

    const seeked = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "seek_msg", {
          duration: Duration,
        })}`
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [seeked] });
  },
};
