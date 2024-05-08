import { ButtonInteraction, EmbedBuilder, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";

export class ButtonPrevious {
  client: Manager;
  interaction: ButtonInteraction;
  channel: VoiceBasedChannel | null;
  language: string;
  player: RainlinkPlayer;
  constructor(
    client: Manager,
    interaction: ButtonInteraction,
    channel: VoiceBasedChannel | null,
    language: string,
    player: RainlinkPlayer
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
            .setDescription(`${this.client.getString(this.language, "error", "no_in_voice")}`)
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
            .setDescription(`${this.client.getString(this.language, "error", "no_same_voice")}`)
            .setColor(this.client.color),
        ],
      });
      return;
    } else if (!this.player || this.player.queue.previous.length == 0) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${this.client.getString(this.language, "button.music", "previous_notfound")}`)
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
      this.player.previous();

      this.player.data.set("endMode", "previous");

      const embed = new EmbedBuilder()
        .setDescription(`${this.client.getString(this.language, "button.music", "previous_msg")}`)
        .setColor(this.client.color);

      this.interaction.reply({ embeds: [embed] });
    }
  }
}
