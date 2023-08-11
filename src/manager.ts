import { Client, GatewayIntentBits, Collection, ColorResolvable } from "discord.js";
import { connectDB } from "./database/connect.js";
import { I18n } from "@hammerhq/localization"
import { resolve } from "path";
import { LavalinkDataType, LavalinkUsingDataType } from "./types/Lavalink.js";
import configData from "./plugins/config.js"
import winstonLogger from "./plugins/logger.js"
import Spotify from 'kazagumo-spotify';
import Deezer from 'kazagumo-deezer';
import Nico from 'kazagumo-nico';
import { Connectors } from "shoukaku";
import { Kazagumo, Plugins } from "kazagumo";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

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
  manager: Kazagumo
  slash: Collection<string, any>
  commands: Collection<string, any>
  premiums: Collection<string, any>
  interval: Collection<string, any>
  sent_queue: Collection<string, any>
  aliases: Collection<string, any>
  websocket: any
  UpdateMusic: any
  UpdateQueueMsg: any
  enSwitch: any
  diSwitch: any

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
      directory: resolve(join(__dirname, "languages")),
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

    process.on("unhandledRejection", (error) =>
    this.logger.log({ level: "error", message: error }),
    );
    process.on("uncaughtException", (error) =>
      this.logger.log({ level: "error", message: error }),
    );

    this.manager = new Kazagumo({
      defaultSearchEngine: "youtube", 
      // MAKE SURE YOU HAVE THIS
      send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
      },
      plugins: this.config.lavalink.ENABLE_SPOTIFY ? [
            new Spotify({
              clientId: this.config.SPOTIFY_ID,
              clientSecret: this.config.SPOTIFY_SECRET,
              playlistPageLimit: 1, // optional ( 100 tracks per page )
              albumPageLimit: 1, // optional ( 50 tracks per page )
              searchLimit: 10, // optional ( track search limit. Max 50 )
              searchMarket: 'US', // optional || default: US ( Enter the country you live in. [ Can only be of 2 letters. For eg: US, IN, EN ] )//
            }),
            new Deezer(),
            new Nico({ searchLimit: 10 }),
            new Plugins.PlayerMoved(this)
          ] : [
            new Deezer(),
            new Nico({ searchLimit: 10 }),
            new Plugins.PlayerMoved(this)
          ],
    }, new Connectors.DiscordJS(this), this.config.lavalink.NODES, this.config.features.AUTOFIX_LAVALINK ? { reconnectTries: 0 } : this.config.lavalink.SHOUKAKU_OPTIONS);
    connectDB(this)
  }

  connect() {
    super.login(this.token)
    return
  }
}