import { ApplicationCommandType, Message } from "discord.js";
import { Manager } from "../manager.js";
import WebSocket from "ws";
import { GlobalInteraction } from "./Interaction.js";
import { JSON_MESSAGE } from "./Websocket.js";

export enum Accessableby {
  Member = "Member",
  Owner = "Owner",
  Premium = "Premium",
  Manager = "Manager",
  Admin = "Admin",
}

export class PrefixCommand {
  name: string = "";
  description: string = "";
  category: string = "";
  accessableby: Accessableby = Accessableby.Member;
  usage: string = "";
  aliases: string[] = [];
  lavalink: boolean = false;
  async run(
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ): Promise<any> {}
}

export class SlashCommand {
  name: string = "";
  description: string = "";
  category: string = "";
  accessableby: Accessableby = Accessableby.Member;
  type?: ApplicationCommandType = undefined;
  lavalink: boolean = false;
  async run(
    interaction: GlobalInteraction,
    client: Manager,
    language: string
  ): Promise<any> {}
}

export type WsCommand = {
  name: string;
  run: (client: Manager, json: JSON_MESSAGE, ws: WebSocket) => Promise<any>;
};
