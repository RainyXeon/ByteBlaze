import {
  Client,
  GatewayIntentBits,
  Collection,
  ColorResolvable,
} from "discord.js";
import { DatabaseService } from "./database/index.js";
import { I18n } from "@hammerhq/localization";
import { resolve } from "path";
import { ConfigDataService } from "./services/ConfigDataService.js";
import { LoggerService } from "./services/LoggerService.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { WebServer } from "./webserver/index.js";
import { ManifestService } from "./services/ManifestService.js";
import { NormalModeIcons } from "./assets/NormalModeIcons.js";
import { SafeModeIcons } from "./assets/SafeModeIcons.js";
import { config } from "dotenv";
import { initHandler } from "./handlers/index.js";
import { KazagumoInit } from "./structures/Kazagumo.js";
import utils from "node:util";
import { DeployService } from "./services/DeployService.js";
import { ByteBlaze } from "./@types/ByteBlaze.js";

config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const loggerService = new LoggerService().init();
const configData = new ConfigDataService().data;
const REGEX = [
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/,
  /^.*(youtu.be\/|list=)([^#\&\?]*).*/,
  /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
  /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
  /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
  /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/,
  /^https?:\/\/(?:www\.|secure\.|sp\.)?nicovideo\.jp\/watch\/([a-z]{2}[0-9]+)/,
  /(?:https:\/\/spotify\.link)\/([A-Za-z0-9]+)/,
  /^https:\/\/deezer\.page\.link\/[a-zA-Z0-9]{12}$/,
];

export declare interface Manager extends ByteBlaze {}

export class Manager extends Client {
  constructor() {
    super({
      shards: process.env.IS_SHARING == "true" ? getInfo().SHARD_LIST : "auto",
      shardCount:
        process.env.IS_SHARING == "true" ? getInfo().TOTAL_SHARDS : undefined,
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      intents: configData.features.MESSAGE_CONTENT.enable
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

    // Initial basic bot config
    loggerService.info("Booting client...");
    this.logger = loggerService;
    this.config = configData;
    this.metadata = new ManifestService().data.metadata.bot;
    this.owner = this.config.bot.OWNER_ID;
    this.color = (this.config.bot.EMBED_COLOR || "#2b2d31") as ColorResolvable;
    this.i18n = new I18n({
      defaultLocale: this.config.bot.LANGUAGE || "en",
      directory: resolve(join(__dirname, "rslp_0.0.3")),
    });
    this.prefix = this.config.features.MESSAGE_CONTENT.commands.prefix || "d!";
    this.shardStatus = false;
    this.REGEX = REGEX;

    if (!this.configVolCheck()) {
      this.logger.warn(
        "Default config volume must between 1 and 100, use default volume (100)"
      );
    }

    if (!this.configSearchCheck()) {
      this.logger.warn(
        "Default config search must have string element, use default"
      );
    }

    // Initial autofix lavalink varibles
    this.lavalinkList = [];
    this.lavalinkUsing = [];
    this.lavalinkUsed = [];

    // Ws varible
    this.config.features.WEB_SERVER.websocket.enable
      ? (this.wsMessage = new Collection())
      : undefined;

    // Collections
    this.commands = new Collection();
    this.premiums = new Collection();
    this.interval = new Collection();
    this.sentQueue = new Collection();
    this.aliases = new Collection();
    this.nplayingMsg = new Collection();
    this.plButton = new Collection();
    this.leaveDelay = new Collection();
    this.nowPlaying = new Collection();
    this.isDatabaseConnected = false;

    // Sharing
    this.cluster =
      process.env.IS_SHARING == "true" ? new ClusterClient(this) : undefined;

    // Remove support for musicard, implements doc check at wiki
    this.config.bot.SAFE_PLAYER_MODE = true;

    // Icons setup
    this.icons = this.config.bot.SAFE_ICONS_MODE
      ? SafeModeIcons
      : NormalModeIcons;

    process.on("unhandledRejection", (error) =>
      this.logger.log({ level: "error", message: utils.inspect(error) })
    );
    process.on("uncaughtException", (error) =>
      this.logger.log({ level: "error", message: utils.inspect(error) })
    );

    if (
      this.config.features.WEB_SERVER.websocket.enable &&
      (!this.config.features.WEB_SERVER.websocket.secret ||
        this.config.features.WEB_SERVER.websocket.secret.length == 0)
    ) {
      this.logger.error("Must have secret in your ws config for secure!");
      process.exit();
    }

    this.manager = new KazagumoInit(this).init;

    if (this.config.features.WEB_SERVER.enable) {
      new WebServer(this);
    }
    new DeployService(this);
    new initHandler(this);
    new DatabaseService(this);
    super.login(this.config.bot.TOKEN);
  }

  configVolCheck(vol: number = this.config.lavalink.DEFAULT_VOLUME) {
    if (!vol || isNaN(vol) || vol > 100 || vol < 1) {
      this.config.lavalink.DEFAULT_VOLUME = 100;
      return false;
    }
    return true;
  }

  configSearchCheck(data: string[] = this.config.lavalink.AUTOCOMPLETE_SEARCH) {
    const defaultSearch = ["yorushika", "yoasobi", "tuyu", "hinkik"];
    if (!data || data.length == 0) {
      this.config.lavalink.AUTOCOMPLETE_SEARCH = defaultSearch;
      return false;
    }
    for (const element of data) {
      if (!this.stringCheck(element)) {
        this.config.lavalink.AUTOCOMPLETE_SEARCH = defaultSearch;
        return false;
      }
    }
    return true;
  }

  stringCheck(data: unknown) {
    if (typeof data === "string" || data instanceof String) return true;
    return false;
  }
}
