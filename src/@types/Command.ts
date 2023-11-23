import { ApplicationCommandType, Message } from "discord.js";
import { Manager } from "../manager.js";
import WebSocket from "ws";
import { GlobalInteraction } from "./Interaction.js";
import { JSON_MESSAGE } from "./Websocket.js";

export type PrefixCommand = {
  name: string;
  description: string;
  category: string;
  accessableby: string;
  usage: string;
  aliases: string[];
  premium?: boolean;
  lavalink?: boolean;
  owner?: boolean;
  isManager?: boolean;
  run: (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => Promise<any>;
};

export type SlashCommand = {
  name: string;
  description: string;
  category: string;
  type?: ApplicationCommandType;
  owner?: boolean;
  premium?: boolean;
  lavalink?: boolean;
  isManager?: boolean;
  run: (
    interaction: GlobalInteraction,
    client: Manager,
    language: string
  ) => Promise<any>;
};

export type WsCommand = {
  name: string;
  run: (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => Promise<void>;
};
