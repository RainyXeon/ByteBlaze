import { ButtonInteraction, EmbedBuilder, TextChannel, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { RainlinkPlayer } from "../../../rainlink/main.js";

export class ButtonPause {
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
    let data = await this.client.db.setup.get(`${this.player.guildId}`);
    if (!data) return;
    if (data.enable === false) return;

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
    } else if (!this.player) {
      this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${this.client.getString(this.language, "error", "no_player")}`)
            .setColor(this.client.color),
        ],
      });
      return;
    } else {
      const getChannel = await this.client.channels.fetch(data.channel).catch(() => undefined);
      if (!getChannel) return;
      let playMsg = await (getChannel as TextChannel)!.messages.fetch(data.playmsg).catch(() => undefined);
      if (!playMsg) return;

      const newPlayer = await this.player.setPause(!this.player.paused);

      newPlayer.paused
        ? playMsg.edit({
            // content: playMsg.content,
            // embeds: new EmbedBuilder(playMsg.embeds),
            components: [this.client.enSwitch],
          })
        : playMsg.edit({
            // content: playMsg.content,
            // embeds: playMsg.embeds,
            components: [this.client.enSwitchMod],
          });

      const embed = new EmbedBuilder()
        .setDescription(
          `${this.client.getString(this.language, "button.music", newPlayer.paused ? "pause_msg" : "resume_msg")}`
        )
        .setColor(this.client.color);

      this.interaction.reply({ embeds: [embed] });
    }
  }
}
