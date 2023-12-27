import {
  EmbedBuilder,
  CommandInteraction,
  GuildMember,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import { AutoReconnectBuilder } from "../../../database/build/AutoReconnect.js";

export default class implements SlashCommand {
  name = ["247"];
  description = "24/7 in voice channel";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "type",
      description: "Choose enable or disable",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Enable",
          value: "enable",
        },
        {
          name: "Disable",
          value: "disable",
        },
      ],
    },
  ];

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

    const data = await new AutoReconnectBuilder(client, player).execute(
      interaction.guild!.id
    );

    const type = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("type");

    if (type == "disable") {
      if (!data.twentyfourseven) {
        const offAl = new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "247_off_already")}`)
          .setColor(client.color);
        return msg.edit({ content: " ", embeds: [offAl] });
      }

      data.current || data.current.length !== 0
        ? await client.db.autoreconnect.set(
            `${interaction.guild!.id}.twentyfourseven`,
            false
          )
        : await client.db.autoreconnect.delete(`${interaction.guild!.id}`);

      player &&
      player.voiceId &&
      (interaction.member as GuildMember)!.voice.channel == null
        ? player.destroy()
        : true;

      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_off")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [on] });
    } else {
      const { channel } = (interaction.member as GuildMember)!.voice;
      if (
        !channel ||
        (interaction.member as GuildMember)!.voice.channel == null
      )
        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "noplayer", "no_voice_247")}`
              )
              .setColor(client.color),
          ],
        });
      
      if (data.twentyfourseven) {
        const onAl = new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "247_on_already")}`)
          .setColor(client.color);
        return msg.edit({ content: " ", embeds: [onAl] });
      }

      if (!player) await client.manager.createPlayer({
        guildId: interaction.guild!.id,
        voiceId: (interaction.member as GuildMember).voice.channel!.id,
        textId: interaction.channel!.id,
        deaf: true,
      })

      await client.db.autoreconnect.set(
        `${interaction.guild!.id}.twentyfourseven`,
        true
      );
      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_on")}`)
        .setColor(client.color);
      return msg.edit({ content: " ", embeds: [on] });
    }
  }
}
