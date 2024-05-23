import { ApplicationCommandOptionType } from "discord.js";

export function convertOption(data: {
  type: ApplicationCommandOptionType;
  value: string;
}): string | "error" {
  if (data.type == ApplicationCommandOptionType.User) return `<@${data.value}>`;
  if (data.type == ApplicationCommandOptionType.Role) return `<@&${data.value}>`;
  if (data.type == ApplicationCommandOptionType.Channel) return `<#${data.value}>`;
  return "error";
}
