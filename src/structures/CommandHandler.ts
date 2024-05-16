import {
  Attachment,
  BaseMessageOptions,
  Channel,
  Collection,
  CommandInteraction,
  Guild,
  GuildMember,
  InteractionResponse,
  Message,
  Role,
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

export type GlobalMsg = InteractionResponse<boolean> | (Message<boolean> | undefined);

export enum ParseMentionEnum {
  ERROR,
  USER,
  ROLE,
  EVERYONE,
  CHANNEL,
}

export interface ParseMentionInterface {
  type: ParseMentionEnum;
  data: User | Channel | Role | true | "error" | undefined;
}

export class CommandHandler {
  public interaction?: CommandInteraction;
  public attactments: Attachment[] = [];
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
  public modeLang: { enable: string; disable: string };
  public USERS_PATTERN: RegExp = /<@!?(\d{17,19})>/;
  public ROLES_PATTERN: RegExp = /<@&(\d{17,19})>/;
  public CHANNELS_PATTERN: RegExp = /<#(\d{17,19})>/;
  public EVERYONE_PATTERN: RegExp = /@(everyone|here)/;

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
    this.modeLang = this.modeLangData;
  }

  get userData() {
    if (this.interaction) {
      return this.interaction.user;
    } else {
      return this.message?.author;
    }
  }

  get modeLangData() {
    return {
      enable: `${this.client.getString(this.language, "global", "enable")}`,
      disable: `${this.client.getString(this.language, "global", "disable")}`,
    };
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

  public async sendMessage(data: string | BaseMessageOptions) {
    if (this.interaction) {
      return await this.interaction.reply(data);
    } else {
      return await this.message?.reply(data);
    }
  }

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
      const data = await this.message?.reply(`**${this.client.user?.username}** is thinking...`);
      return (this.msg = data);
    }
  }

  public async editReply(data: BaseMessageOptions): Promise<GlobalMsg> {
    if (!this.msg) {
      this.client.logger.error(CommandHandler.name, "You have not declared deferReply()");
      return;
    }
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

  public async parseMentions(data: string): Promise<ParseMentionInterface> {
    if (this.USERS_PATTERN.test(data)) {
      const extract = this.USERS_PATTERN.exec(data);
      const user = await this.client.users.fetch(extract![1]).catch(() => undefined);
      if (!user || user == null)
        return {
          type: ParseMentionEnum.ERROR,
          data: "error",
        };
      return {
        type: ParseMentionEnum.USER,
        data: user,
      };
    }
    if (this.CHANNELS_PATTERN.test(data)) {
      const extract = this.CHANNELS_PATTERN.exec(data);
      const channel = await this.client.channels.fetch(extract![1]).catch(() => undefined);
      if (!channel || channel == null)
        return {
          type: ParseMentionEnum.ERROR,
          data: "error",
        };
      return {
        type: ParseMentionEnum.CHANNEL,
        data: channel,
      };
    }
    if (this.ROLES_PATTERN.test(data)) {
      const extract = this.ROLES_PATTERN.exec(data);
      const role = this.message
        ? await this.message.guild?.roles.fetch(extract![1]).catch(() => undefined)
        : await this.interaction?.guild?.roles.fetch(extract![1]).catch(() => undefined);
      if (!role || role == null)
        return {
          type: ParseMentionEnum.ERROR,
          data: "error",
        };
      return {
        type: ParseMentionEnum.ROLE,
        data: role,
      };
    }
    if (this.EVERYONE_PATTERN.test(data)) {
      return {
        type: ParseMentionEnum.EVERYONE,
        data: true,
      };
    }
    return {
      type: ParseMentionEnum.ERROR,
      data: "error",
    };
  }

  public addAttachment(data: Collection<string, Attachment>) {
    return this.attactments.push(
      ...data.map((data) => {
        return data;
      })
    );
  }
}
