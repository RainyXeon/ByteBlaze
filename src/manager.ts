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
import { DisTube } from 'distube'
import { SpotifyPlugin } from '@distube/spotify'
import { SoundCloudPlugin } from '@distube/soundcloud'
import { YtDlpPlugin } from '@distube/yt-dlp'
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { QuickDB } from "quick.db";
import check_lavalink_server from "./lava_scrap/check_lavalink_server.js";
import { WebServer } from "./webserver/index.js";
import WebSocket from "ws";
const __dirname = dirname(fileURLToPath(import.meta.url));

winstonLogger.info("Booting client...");

export class Manager extends Client {
  // Interface
  token: string;
  config: Record<string, any>;
  logger: any;
  db!: QuickDB;
  owner: string;
  dev: string[];
  color: ColorResolvable;
  i18n: I18n;
  prefix: string;
  shard_status: boolean;
  lavalink_list: LavalinkDataType[];
  lavalink_using: LavalinkUsingDataType[];
  fixing_nodes: boolean;
  used_lavalink: LavalinkUsingDataType[];
  manager: DisTube;
  slash: Collection<string, any>;
  commands: Collection<string, any>;
  premiums: Collection<string, any>;
  interval: Collection<string, any>;
  sent_queue: Collection<string, any>;
  aliases: Collection<string, any>;
  websocket?: WebSocket;
  UpdateMusic!: (player: any) => Promise<void | Message<true>>;
  UpdateQueueMsg!: (player: any) => Promise<void | Message<true>>;
  enSwitch!: ActionRowBuilder<ButtonBuilder>;
  diSwitch!: ActionRowBuilder<ButtonBuilder>;
  is_db_connected: boolean;
  ws_message?: Collection<string, any>;

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

    this.token = this.config.bot.TOKEN;
    this.owner = this.config.bot.OWNER_ID;
    this.dev = this.config.bot.DEV_ID;
    this.color = this.config.bot.EMBED_COLOR || "#2b2d31";
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
    this.is_db_connected = false;

    process.on("unhandledRejection", (error) =>
      this.logger.log({ level: "error", message: error }),
    );
    process.on("uncaughtException", (error) =>
      this.logger.log({ level: "error", message: error }),
    );

    if (
      this.config.features.WEB_SERVER.websocket.enable &&
      (!this.config.features.WEB_SERVER.websocket.secret ||
        this.config.features.WEB_SERVER.websocket.secret.length == 0)
    ) {
      this.logger.error("Must have secret in your ws config for secure!");
      process.exit();
    }

    this.manager = new DisTube(this, {
      leaveOnStop: false,
      emitNewSongOnly: true,
      emitAddSongWhenCreatingQueue: false,
      emitAddListWhenCreatingQueue: false,
      plugins: [
        new SpotifyPlugin({
          emitEventsAfterFetching: true
        }),
        new SoundCloudPlugin(),
        new YtDlpPlugin()
      ]
    })

    console.log(this.manager)

    // if (this.config.features.AUTOFIX_LAVALINK) {
    //   check_lavalink_server(this);
    //   setInterval(async () => {
    //     check_lavalink_server(this);
    //   }, 1800000);
    // }

    // if (this.config.features.WEB_SERVER.enable) {
    //   WebServer(this);
    // }
    // const loadFile = [
    //   "loadEvents.js",
    //   "loadNodeEvents.js",
    //   "loadPlayer.js",
    //   "loadWebsocket.js",
    //   "loadCommand.js",
    // ];
    // if (!this.config.features.WEB_SERVER.websocket.enable)
    //   loadFile.splice(loadFile.indexOf("loadWebsocket.js"), 1);
    // loadFile.forEach(async (x) => {
    //   (await import(`./handlers/${x}`)).default(this);
    // });

    connectDB(this);
  }

  connect() {
    super.login(this.token);
  }
}
