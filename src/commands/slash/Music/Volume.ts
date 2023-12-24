import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Accessableby, SlashCommand } from "../../../@types/Command.js";
import { KazagumoPlayer } from "kazagumo.mod";
import { AutoReconnectBuilder } from "../../../database/build/AutoReconnect.js";

// Main code
export default class implements SlashCommand {
  name = ["volume"];
  description = "Adjusts the volume of the bot.";
  category = "Music";
  accessableby = Accessableby.Member;
  lavalink = true;
  options = [
    {
      name: "amount",
      description: "The amount of volume to set the bot to.",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ];

  async run(
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) {
    await interaction.deferReply({ ephemeral: false });
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getNumber("amount");
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "volume_loading")}`
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
          volume: String(value),
        })}`
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [changevol] });
  }

  async setVol247(client: Manager, player: KazagumoPlayer, vol: number) {
    const check = await new AutoReconnectBuilder(client, player).execute(
      player.guildId
    );
    if (check) {
      await client.db.autoreconnect.set(`${player.guildId}.config.loop`, vol);
    }
  }
}
