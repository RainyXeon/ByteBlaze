import { ButtonInteraction, EmbedBuilder, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoPlayer } from "../../../lib/main.js";

export class ButtonSkip {
  client: Manager;
  interaction: ButtonInteraction;
  channel: VoiceBasedChannel | null;
  language: string;
  player: KazagumoPlayer;
  constructor(
    client: Manager,
    interaction: ButtonInteraction,
    channel: VoiceBasedChannel | null,
    language: string,
    player: KazagumoPlayer
  ) {
    this.channel = channel;
    this.client = client;
    this.language = language;
    this.player = player;
    this.interaction = interaction;
    this.execute();
  }

  async execute() {
    if (!this.channel) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "noplayer", "no_voice")}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (
      this.interaction.guild!.members.me!.voice.channel &&
      !this.interaction.guild!.members.me!.voice.channel.equals(this.channel)
    ) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "noplayer", "no_voice")}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (!this.player) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "noplayer", "no_player")}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
    }

    if (this.player.queue.size == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(this.language, "music", "skip_notfound")}`
        )
        .setColor(this.client.color);

      this.interaction.reply({ embeds: [embed] });
    } else {
      await this.player.skip();

      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(this.language, "music", "skip_msg")}`
        )
        .setColor(this.client.color);

      this.interaction.reply({ embeds: [embed] });
      this.client.emit("playerSkip", this.player);
    }
  }
}
