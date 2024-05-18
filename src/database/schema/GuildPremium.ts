export interface GuildPremium {
  id: string;
  isPremium: boolean;
  redeemedBy: {
    id: string;
    name: string;
    createdAt: number;
    ownerId: string;
  };
  redeemedAt: number;
  expiresAt: number | "lifetime";
  plan: string;
}
