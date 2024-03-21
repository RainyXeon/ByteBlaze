import { User } from "discord.js";

export interface Premium {
  id: string;
  isPremium: boolean;
  redeemedBy: User;
  redeemedAt: number;
  expiresAt: number | "lifetime";
  plan: string;
}
