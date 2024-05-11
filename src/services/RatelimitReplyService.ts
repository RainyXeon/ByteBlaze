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
      const setup = await this.client.db.setup.get(this.interaction.guildId!);
      const msg = await this.interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.getString(this.language, "error", "ratelimit", {
                time: String(this.time),
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      if (!setup || setup == null || setup.channel !== this.interaction.channelId)
        setTimeout(() => msg.delete().catch(() => null), this.client.config.bot.DELETE_MSG_TIMEOUT);

      return;
    }

    if (this.button) {
      const setup = await this.client.db.setup.get(this.button.guildId!);
      const msg = await this.button.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.getString(this.language, "error", "ratelimit", {
                time: String(this.time),
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      if (!setup || setup == null || setup.channel !== this.button.channelId)
        setTimeout(() => msg.delete().catch(() => null), this.client.config.bot.DELETE_MSG_TIMEOUT);

      return;
    }

    if (this.message) {
      const setup = await this.client.db.setup.get(this.message.guildId!);
      const msg = await this.message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${this.client.getString(this.language, "error", "ratelimit", {
                time: String(this.time),
              })}`
            )
            .setColor(this.client.color),
        ],
      });
      if (!setup || setup == null || setup.channel !== this.message.channelId)
        setTimeout(() => msg.delete().catch(() => null), this.client.config.bot.DELETE_MSG_TIMEOUT);

      return;
    }
  }
}
