import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";
import {
  Accessableby,
  CommandOptionInterface,
  SlashCommand,
} from "../../../@types/Command.js";
import { KazagumoPlayer } from "better-kazagumo";

export default class implements SlashCommand {
  name = ["247"];
  description = "24/7 in voice channel";
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
            `${client.i18n.get(language, "music", "247_loading")}`
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

    let data = await client.db.autoreconnect.get(`${interaction.guild!.id}`);

    if (data) {
      await client.db.autoreconnect.delete(`${interaction.guild!.id}`);
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

      await client.db.autoreconnect.set(`${interaction.guild!.id}`, {
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
