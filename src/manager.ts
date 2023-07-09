import { Client, GatewayIntentBits, Collection, ColorResolvable } from "discord.js";
import { connectDB } from "./database/connect.js";
import { I18n } from "@hammerhq/localization"
import { resolve } from "path";
import { LavalinkDataType, LavalinkUsingDataType } from "./types/Lavalink.js";
import configData from "./plugins/config.js"
import winstonLogger from "./plugins/logger.js"

export class Manager extends Client {
  // Interface
  token: string;
  config: any;
  logger: any;
  db: any;
  owner: string;
  dev: string[]
  color: ColorResolvable
  i18n: I18n
  prefix: string
  shard_status: boolean
  lavalink_list: LavalinkDataType[]
  lavalink_using: LavalinkUsingDataType[]
  fixing_nodes: boolean
  used_lavalink: LavalinkUsingDataType[]
  slash: Collection<string, any>
  commands: Collection<string, any>
  premiums: Collection<string, any>
  interval: Collection<string, any>
  sent_queue: Collection<string, any>
  aliases: Collection<string, any>

  // Main class
  constructor() {
    super({
      shards: 'auto',
      allowedMentions: {
          parse: ["roles", "users", "everyone"],
          repliedUser: false
      },
      intents: configData.features.MESSAGE_CONTENT.enable ? [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
      ] : [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMessages,
      ]
    })
    this.logger = winstonLogger
    this.logger.info("Booting client...")
    this.config = configData

    this.token = this.config.bot.TOKEN;
    this.owner = this.config.bot.OWNER_ID;
    this.dev = this.config.bot.DEV_ID;
    this.color = this.config.bot.EMBED_COLOR || "#2b2d31";
    this.i18n = new I18n({
      defaultLocale: this.config.bot.LANGUAGE || "en",
      directory: resolve("./src/languages"),
    });
    this.prefix = this.config.features.MESSAGE_CONTENT.prefix || "d!"
    this.shard_status = false

    // Auto fix lavalink varibles
    this.lavalink_list = []
    this.lavalink_using = []
    this.fixing_nodes = false
    this.used_lavalink = []

    // Collections
    this.slash = new Collection()
    this.commands = new Collection()
    this.premiums = new Collection()
    this.interval = new Collection()
    this.sent_queue = new Collection()
    this.aliases = new Collection()

    connectDB(this)
  }

  connect() {
    super.login(this.token)
    return
  }
}