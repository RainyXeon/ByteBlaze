import {
  AnySelectMenuInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  CommandInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export type GlobalInteraction =
  | CommandInteraction
  | AnySelectMenuInteraction
  | ButtonInteraction
  | ModalSubmitInteraction
  | AutocompleteInteraction;

export type AutocompleteInteractionChoices = {
  name: string;
  value: string;
};
