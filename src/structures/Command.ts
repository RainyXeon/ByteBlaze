import { ApplicationCommandOptionType } from "discord.js";
import { Manager } from "../manager.js";
import { CommandHandler } from "./CommandHandler.js";

export enum Accessableby {
  Member = "Member",
  Owner = "Owner",
  Premium = "Premium",
  Manager = "Manager",
  Admin = "Admin",
}

export type CommandOptionChoiceInterface = {
  name: string;
  value: string;
};

export type CommandOptionInterface = {
  name: string;
  description: string;
  required?: boolean;
  type: ApplicationCommandOptionType | undefined;
  autocomplete?: boolean;
  choices?: CommandOptionChoiceInterface[];
};

export class Command {
  name: string[] = [];
  description: string = "";
  category: string = "";
  accessableby: Accessableby = Accessableby.Member;
  usage: string = "";
  aliases: string[] = [];
  lavalink: boolean = false;
  playerCheck: boolean = false;
  usingInteraction: boolean = false;
  sameVoiceCheck: boolean = false;
  options: CommandOptionInterface[] = [];
  async execute(client: Manager, handler: CommandHandler): Promise<any> {}
}
