import {
  Client,
  GatewayIntentBits,
  Collection,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  Message,
} from "discord.js";
import { connectDB } from "./database/index.js";
import { I18n } from "@hammerhq/localization";
import { resolve } from "path";
import { LavalinkDataType, LavalinkUsingDataType } from "./types/Lavalink.js";
import * as configData from "./plugins/config.js";
import winstonLogger from "./plugins/logger.js";
// import Deezer from "kazagumo-deezer";
// import Nico from "kazagumo-nico";
// import Apple from "kazagumo-apple";
import { Connectors } from "shoukaku";
import { Kazagumo, KazagumoPlayer, Plugins } from "better-kazagumo";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { QuickDB } from "quick.db";
import check_lavalink_server from "./lava_scrap/check_lavalink_server.js";
import { WebServer } from "./webserver/index.js";
import WebSocket from "ws";
import { Metadata } from "./types/Metadata.js";
import { client_metadata } from "./metadata.js";
import { PrefixCommand, SlashCommand, WsCommand } from "./types/Command.js";
import { Config } from "./types/Config.js";
import { PremiumUser } from "./types/User.js";
import { IconType } from "./types/Emoji.js";
import { NormalModeIcons } from "./assets/normalMode.js";
import { SafeModeIcons } from "./assets/safeMode.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

winstonLogger.info("Booting client...");

export class Manager extends Client {
  // Interface
  token: string;
  metadata: Metadata;
  config: Config;
  logger: any;
  db!: QuickDB;
  owner: string;
  dev: string[];
  color: ColorResolvable;
  i18n: I18n;
  prefix: string;
  is_db_connected: boolean;
  shard_status: boolean;
  lavalink_list: LavalinkDataType[];
  lavalink_using: LavalinkUsingDataType[];
  fixing_nodes: boolean;
  used_lavalink: LavalinkUsingDataType[];
  manager: Kazagumo;
  slash: Collection<string, SlashCommand>;
  commands: Collection<string, PrefixCommand>;
  premiums: Collection<string, PremiumUser>;
  interval: Collection<string, NodeJS.Timer>;
  sent_queue: Collection<string, boolean>;
  nplaying_msg: Collection<string, string>;
  aliases: Collection<string, string>;
  websocket?: WebSocket;
  ws_message?: Collection<string, WsCommand>;
  UpdateMusic!: (player: KazagumoPlayer) => Promise<void | Message<true>>;
  UpdateQueueMsg!: (player: KazagumoPlayer) => Promise<void | Message<true>>;
  enSwitch!: ActionRowBuilder<ButtonBuilder>;
  diSwitch!: ActionRowBuilder<ButtonBuilder>;
  icons: IconType;

  // Main class
  constructor() {
    super({
      shards: "auto",
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      intents: configData.default.features.MESSAGE_CONTENT.enable
        ? [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ]
        : [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
          ],
    });
    this.logger = winstonLogger;
    this.config = configData.default;
    this.metadata = client_metadata;
    this.token = this.config.bot.TOKEN;
    this.owner = this.config.bot.OWNER_ID;
    this.dev = this.config.features.DEV_ID;
    this.color = (this.config.bot.EMBED_COLOR || "#2b2d31") as ColorResolvable;
    this.i18n = new I18n({
      defaultLocale: this.config.bot.LANGUAGE || "en",
      directory: resolve(join(__dirname, "languages")),
    });
    this.prefix = this.config.features.MESSAGE_CONTENT.prefix || "d!";
    this.shard_status = false;

    // Auto fix lavalink varibles
    this.lavalink_list = [];
    this.lavalink_using = [];
    this.fixing_nodes = false;
    this.used_lavalink = [];

    // Ws varible
    this.config.features.WEB_SERVER.websocket.enable
      ? (this.ws_message = new Collection())
      : undefined;

    // Collections
    this.slash = new Collection();
    this.commands = new Collection();
    this.premiums = new Collection();
    this.interval = new Collection();
    this.sent_queue = new Collection();
    this.aliases = new Collection();
    this.nplaying_msg = new Collection();
    this.is_db_connected = false;

    // Icons setup
    this.icons = this.config.bot.SAFE_ICONS_MODE
      ? SafeModeIcons
      : NormalModeIcons;

    process.on("unhandledRejection", (error) =>
      this.logger.log({ level: "error", message: String(error) })
    );
    process.on("uncaughtException", (error) =>
      this.logger.log({ level: "error", message: String(error) })
    );

    if (
      this.config.features.WEB_SERVER.websocket.enable &&
      (!this.config.features.WEB_SERVER.websocket.secret ||
        this.config.features.WEB_SERVER.websocket.secret.length == 0)
    ) {
      this.logger.error("Must have secret in your ws config for secure!");
      process.exit();
    }

    this.manager = new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        // MAKE SURE YOU HAVE THIS
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
        plugins: this.config.lavalink.SPOTIFY.enable
          ? [
              new Plugins.Spotify({
                clientId: this.config.lavalink.SPOTIFY.id,
                clientSecret: this.config.lavalink.SPOTIFY.secret,
                playlistPageLimit: 1, // optional ( 100 tracks per page )
                albumPageLimit: 1, // optional ( 50 tracks per page )
                searchLimit: 10, // optional ( track search limit. Max 50 )
              }),
              new Plugins.Deezer(),
              new Plugins.Nico({ searchLimit: 10 }),
              new Plugins.PlayerMoved(this),
              new Plugins.Apple({ countryCode: "us" }),
            ]
          : [
              new Plugins.Deezer(),
              new Plugins.Nico({ searchLimit: 10 }),
              new Plugins.PlayerMoved(this),
              new Plugins.Apple({ countryCode: "us" }),
            ],
      },
      new Connectors.DiscordJS(this),
      this.config.lavalink.NODES,
      this.config.features.AUTOFIX_LAVALINK.enable
        ? {
            reconnectTries:
              this.config.features.AUTOFIX_LAVALINK.reconnectTries,
            restTimeout: this.config.features.AUTOFIX_LAVALINK.restTimeout,
          }
        : this.config.lavalink.SHOUKAKU_OPTIONS
    );

    this.manager.on("debug" as any, (logs) => {
      if (this.config.bot.DEBUG_MODE) return this.logger.debug(logs);
    });

    if (this.config.features.AUTOFIX_LAVALINK.enable) {
      check_lavalink_server(this);
      setInterval(async () => {
        check_lavalink_server(this);
      }, 1800000);
    }

    if (this.config.features.WEB_SERVER.enable) {
      WebServer(this);
    }
    const loadFile = [
      "loadEvents.js",
      "loadNodeEvents.js",
      "loadPlayer.js",
      "loadWebsocket.js",
      "loadCommand.js",
    ];
    if (!this.config.features.WEB_SERVER.websocket.enable)
      loadFile.splice(loadFile.indexOf("loadWebsocket.js"), 1);
    loadFile.forEach(async (x) => {
      (await import(`./handlers/${x}`)).default(this);
    });

    connectDB(this);
  }

  connect() {
    super.login(this.token);
  }
}
