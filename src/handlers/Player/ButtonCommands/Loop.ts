import { ButtonInteraction, EmbedBuilder, VoiceBasedChannel } from "discord.js";
import { Manager } from "../../../manager.js";
import { KazagumoPlayer } from "better-kazagumo";
import { KazagumoLoop } from "../../../@types/Lavalink.js";

export class ButtonLoop {
  client: Manager;
  interaction: ButtonInteraction;
  language: string;
  player: KazagumoPlayer;
  constructor(
    client: Manager,
    interaction: ButtonInteraction,
    language: string,
    player: KazagumoPlayer
  ) {
    this.client = client;
    this.language = language;
    this.player = player;
    this.interaction = interaction;
    this.execute();
  }

  async execute() {
    if (!this.player) {
      return;
    }

    if (this.player.loop === "queue") {
      await this.player.setLoop(KazagumoLoop.none);

      const unloopall = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(this.language, "music", "unloopall")}`
        )
        .setColor(this.client.color);
      await this.interaction.reply({
        content: " ",
        embeds: [unloopall],
      });
      return;
    } else if (this.player.loop === "none") {
      await this.player.setLoop(KazagumoLoop.queue);
      const loopall = new EmbedBuilder()
        .setDescription(
          `${this.client.i18n.get(this.language, "music", "loopall")}`
        )
        .setColor(this.client.color);
      await this.interaction.reply({
        content: " ",
        embeds: [loopall],
      });
      return;
    }
  }
}
