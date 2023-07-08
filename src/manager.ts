import { Client, GatewayIntentBits } from "discord.js";
import { connectDB } from "./database/connect";

export class Manager extends Client {
  // Interface
  token: string;
  config: any;
  logger: any;
  db: any

  constructor() {
    super({
      shards: 'auto',
      allowedMentions: {
          parse: ["roles", "users", "everyone"],
          repliedUser: false
      },
      intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
      ]
    })
    this.logger = require("./plugins/logger")
    this.config = require("./plugins/config")

    this.token = this.config.bot.TOKEN

    this.once("ready", () => {
      this.logger.info("Bot is ready!");
    });

    connectDB(this)
  }

  connect() {
    super.login(this.token)
    return
  }
}