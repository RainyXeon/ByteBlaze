import {
  BaseMessageOptions,
  CommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  InteractionResponse,
  Message,
  TextBasedChannel,
  User,
} from "discord.js";
import { Manager } from "../manager.js";

export type CommandHandlerOptions = {
  interaction?: CommandInteraction;
  message?: Message;
  language: string;
  client: Manager;
  args: string[];
  prefix: string;
};

export type GlobalMsg =
  | InteractionResponse<boolean>
  | (Message<boolean> | undefined);

export class CommandHandler {
  public interaction?: CommandInteraction;
  public message?: Message;
  public language: string;
  public user?: User | null;
  public guild?: Guild | null;
  public member?: GuildMember | null;
  public channel?: TextBasedChannel | null;
  public client: Manager;
  public args: string[];
  public createdAt: number;
  public msg: GlobalMsg;
  public prefix: string;

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
    this.prefix = options.prefix;
    this.channel = this.channelData;
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

  get channelData() {
    if (this.interaction) {
      return this.interaction.channel;
    } else {
      return this.message?.channel;
    }
  }

  // public async sendMessage(
  //   data: string | BaseMessageOptions
  // ) {
  //   if (this.interaction) {
  //     return await this.interaction.reply(data);
  //   } else {
  //     return await this.message?.reply(data);
  //   }
  // }

  public async followUp(data: string | BaseMessageOptions) {
    if (this.interaction) {
      return await this.interaction.followUp(data);
    } else {
      return await this.message?.reply(data);
    }
  }

  public async deferReply() {
    if (this.interaction) {
      const data = await this.interaction.deferReply({ ephemeral: false });
      return (this.msg = data);
    } else {
      const data = await this.message?.reply(
        `**${this.client.user?.username}** is thinking...`
      );
      return (this.msg = data);
    }
  }

  public async editReply(data: BaseMessageOptions): Promise<GlobalMsg> {
    if (!this.msg)
      return this.client.logger.error("You have not declared deferReply()");
    if (this.interaction) {
      return this.msg.edit(data);
    } else {
      if (data.embeds && !data.content)
        return this.msg.edit({
          content: "",
          embeds: data.embeds,
          components: data.components,
          allowedMentions: data.allowedMentions,
        });
      else return this.msg.edit(data);
    }
  }

  public async checkArgs(options: {
    args: number;
    usage: string;
    commandName: string[];
  }): Promise<boolean | "error"> {
    const commandString = this.interaction
      ? options.commandName.join(" ")
      : options.commandName.join("-");
    const exampleString = `${this.prefix}${commandString} ${options.usage}`;

    if (!this.msg) {
      this.client.logger.error("You have not declared deferReply()");
      return "error";
    }

    if (this.args.length !== options.args) {
      this.editReply({
        embeds: [
          new EmbedBuilder().setDescription(
            `${this.client.i18n.get(this.language, "error", "wrong_args", {
              example: exampleString,
            })}`
          ),
        ],
      });
      return false;
    }
    return true;
  }

  public async sendArgsError(options: {
    args: number;
    usage: string;
    commandName: string[];
  }): Promise<void> {
    const commandString = this.interaction
      ? options.commandName.join(" ")
      : options.commandName.join("-");
    const exampleString = `${this.prefix}${commandString} ${options.usage}`;

    if (!this.msg) {
      this.client.logger.error("You have not declared deferReply()");
      return;
    }

    this.editReply({
      embeds: [
        new EmbedBuilder().setDescription(
          `${this.client.i18n.get(this.language, "error", "wrong_args", {
            example: exampleString,
          })}`
        ),
      ],
    });
    return;
  }
}
