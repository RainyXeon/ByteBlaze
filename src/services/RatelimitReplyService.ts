import { ButtonInteraction, EmbedBuilder, Message } from "discord.js";
import { NoAutoInteraction } from "../@types/Interaction.js";
import { Manager } from "../manager.js";

export interface RatelimitReplyServiceOptions {
  message?: Message;
  interaction?: NoAutoInteraction;
  button?: ButtonInteraction;
  language: string;
  client: Manager;
  time: number;
}

export class RatelimitReplyService {
  message?: Message;
  interaction?: NoAutoInteraction;
  button?: ButtonInteraction;
  language: string;
  client: Manager;
  time: number;
  constructor(options: RatelimitReplyServiceOptions) {
    this.language = options.language;
    this.client = options.client;
    this.interaction = options.interaction;
    this.button = options.button;
    this.message = options.message;
    this.time = options.time;
  }

  async reply(): Promise<void> {
    if (this.interaction) {
      const msg = await this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "utilities", "ratelimit", {
                time: String(this.time),
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    }

    if (this.button) {
      this.button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "utilities", "ratelimit", {
                time: String(this.time),
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    }

    if (this.message) {
      this.message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.i18n.get(this.language, "utilities", "ratelimit", {
                time: String(this.time),
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      return;
    }
  }
}
