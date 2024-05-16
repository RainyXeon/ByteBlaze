import { Guild } from "discord.js";

export interface GuildPremium {
  id: string;
  isPremium: boolean;
  redeemedBy: Guild;
  redeemedAt: number;
  expiresAt: number | "lifetime";
  plan: string;
}
