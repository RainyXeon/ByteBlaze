import {
  AnySelectMenuInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  CommandInteraction,
  ModalSubmitInteraction,
  ApplicationCommandType,
  PermissionFlagsBits,
} from "discord.js";
import { Manager } from "../manager.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { Accessableby } from "./Command.js";

export type GlobalInteraction =
  | CommandInteraction
  | AnySelectMenuInteraction
  | ButtonInteraction
  | ModalSubmitInteraction
  | AutocompleteInteraction;

export type NoAutoInteraction =
  | CommandInteraction
  | AnySelectMenuInteraction
  | ButtonInteraction
  | ModalSubmitInteraction;

export type AutocompleteInteractionChoices = {
  name: string;
  value: string;
};

export type CommandOptionChoiceInterface = {
  name: string;
  value: string;
};

export type CommandOptionInterface = {
  name: string;
  description: string;
  required?: boolean;
  type: ApplicationCommandOptionType | undefined | ApplicationCommandType;
  autocomplete?: boolean;
  options?: CommandOptionInterface[];
  choices?: CommandOptionChoiceInterface[];
};

export type CommandInterface = {
  type: ApplicationCommandOptionType | undefined | ApplicationCommandType;
  name: string[];
  description: string;
  category: string;
  accessableby: Accessableby;
  lavalink?: boolean;
  options: CommandOptionInterface[];
  defaultPermission?: undefined | typeof PermissionFlagsBits;
  run: (
    interaction: GlobalInteraction,
    client: Manager,
    language: string
  ) => void;
};

export type UploadCommandInterface = {
  type: ApplicationCommandOptionType | undefined | ApplicationCommandType;
  name: string;
  description: string;
  defaultPermission?: undefined | typeof PermissionFlagsBits;
  options?: CommandOptionInterface[];
};
