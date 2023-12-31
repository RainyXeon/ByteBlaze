import {
  CommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  Message,
  User,
} from "discord.js";
import { Manager } from "../manager.js";

export type CommandHandlerOptions = {
  interaction?: CommandInteraction;
  message?: Message;
  language: string;
  client: Manager;
  args: string[];
};

export class CommandHandler {
  interaction?: CommandInteraction;
  message?: Message;
  language: string;
  user?: User | null;
  guild?: Guild | null;
  member?: GuildMember | null;
  client: Manager;
  args: string[];
  createdAt: number;

  constructor(options: CommandHandlerOptions) {
    this.client = options.client;
    this.interaction = options.interaction;
    this.message = options.message;
    this.language = options.language;
    this.guild = this.guildData;
    this.user = this.userData;
    this.member = this.memberData;
    this.args = options.args;
    this.createdAt = this.createdStimeStampData;
  }

  get userData() {
    if (this.interaction) {
      return this.interaction.user;
    } else {
      return this.message?.author;
    }
  }

  get guildData() {
    if (this.interaction) {
      return this.interaction.guild;
    } else {
      return this.message?.guild;
    }
  }

  get memberData() {
    if (this.interaction) {
      return this.interaction.member as GuildMember;
    } else {
      return this.message?.member;
    }
  }

  get createdStimeStampData() {
    if (this.interaction) {
      return Number(this.interaction.createdTimestamp);
    } else {
      return Number(this.message?.createdTimestamp);
    }
  }

  public async sendMessage(
    data: string | { embeds: EmbedBuilder[]; content?: string }
  ) {
    if (this.interaction) {
      await this.interaction.deferReply({ ephemeral: false });
      return await this.interaction.editReply(data);
    } else {
      return await this.message?.reply(data);
    }
  }

  public async sendFollowUp(
    data: string | { embeds: EmbedBuilder[]; content?: string }
  ) {
    if (this.interaction) {
      return await this.interaction.followUp(data);
    } else {
      return await this.message?.reply(data);
    }
  }
}
