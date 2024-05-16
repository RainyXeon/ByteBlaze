import {
  Client,
  GatewayIntentBits,
  ColorResolvable,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  Collection,
  InteractionCollector,
  ButtonInteraction,
} from "discord.js";
import { DatabaseService } from "./database/index.js";
import { I18n, I18nArgs } from "@hammerhq/localization";
import { resolve } from "path";
import { LoggerService } from "./services/LoggerService.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { WebServer } from "./web/server.js";
import { ManifestService } from "./services/ManifestService.js";
import { NormalModeIcons } from "./assets/NormalModeIcons.js";
import { SafeModeIcons } from "./assets/SafeModeIcons.js";
import { config } from "dotenv";
import { initHandler } from "./handlers/index.js";
import { DeployService } from "./services/DeployService.js";
import { RainlinkInit } from "./structures/Rainlink.js";
import { Metadata } from "./@types/Metadata.js";
import { Config } from "./@types/Config.js";
import { DatabaseTable } from "./database/@types.js";
import { LavalinkDataType, LavalinkUsingDataType } from "./@types/Lavalink.js";
import { Rainlink } from "./rainlink/Rainlink.js";
import { Command } from "./structures/Command.js";
import { PlayerButton } from "./@types/Button.js";
import { GlobalMsg } from "./structures/CommandHandler.js";
import { RainlinkPlayer } from "./rainlink/main.js";
import { IconType } from "./@types/Emoji.js";
import { TopggService } from "./services/TopggService.js";
config();

export class Manager extends Client {
  public metadata: Metadata;
  public logger: LoggerService;
  public db!: DatabaseTable;
  public owner: string;
  public color: ColorResolvable;
  public i18n: I18n;
  public prefix: string;
  public isDatabaseConnected: boolean;
  public shardStatus: boolean;
  public lavalinkList: LavalinkDataType[];
  public lavalinkUsing: LavalinkUsingDataType[];
  public lavalinkUsed: LavalinkUsingDataType[];
  public rainlink: Rainlink;
  public commands: Collection<string, Command>;
  public interval: Collection<string, NodeJS.Timer>;
  public sentQueue: Collection<string, boolean>;
  public nplayingMsg: Collection<string, { coll: InteractionCollector<ButtonInteraction<"cached">>; msg: Message }>;
  public aliases: Collection<string, string>;
  public plButton: Collection<string, PlayerButton>;
  public leaveDelay: Collection<string, NodeJS.Timeout>;
  public nowPlaying: Collection<string, { interval: NodeJS.Timeout; msg: GlobalMsg }>;
  public wsl: Collection<string, { send: (data: Record<string, unknown>) => void }>;
  public UpdateMusic!: (player: RainlinkPlayer) => Promise<void | Message<true>>;
  public UpdateQueueMsg!: (player: RainlinkPlayer) => Promise<void | Message<true>>;
  public enSwitch!: ActionRowBuilder<ButtonBuilder>;
  public diSwitch!: ActionRowBuilder<ButtonBuilder>;
  public enSwitchMod!: ActionRowBuilder<ButtonBuilder>;
  public topgg?: TopggService;
  public icons: IconType;
  public cluster?: ClusterClient<Client>;
  public REGEX: RegExp[];

  constructor(
    public config: Config,
    public clientIndex: number,
    isMsgEnable: boolean
  ) {
    super({
      shards: process.env.IS_SHARING == "true" ? getInfo().SHARD_LIST : "auto",
      shardCount: process.env.IS_SHARING == "true" ? getInfo().TOTAL_SHARDS : 1,
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      intents: isMsgEnable
        ? [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ]
        : [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages],
    });

    // Initial basic bot config
    const __dirname = dirname(fileURLToPath(import.meta.url));
    this.logger = new LoggerService(this, clientIndex);
    this.logger.info("ClientManager", "Booting client...");
    this.metadata = new ManifestService().data.metadata.bot;
    this.owner = this.config.bot.OWNER_ID;
    this.color = (this.config.bot.EMBED_COLOR || "#2b2d31") as ColorResolvable;
    this.i18n = new I18n({
      defaultLocale: this.config.bot.LANGUAGE || "en",
      directory: resolve(join(__dirname, "languages")),
    });
    this.prefix = this.config.features.MESSAGE_CONTENT.commands.prefix || "d!";
    this.shardStatus = false;
    this.REGEX = [
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

    if (!this.config.lavalink.AVOID_SUSPEND)
      this.logger.warn(
        "ClientManager",
        "You just disabled AVOID_SUSPEND feature. Enable this on app.yml to avoid discord suspend your bot!"
      );
    // Initial autofix lavalink varibles
    this.lavalinkList = [];
    this.lavalinkUsing = [];
    this.lavalinkUsed = [];

    // Collections
    this.commands = new Collection<string, Command>();
    this.interval = new Collection<string, NodeJS.Timer>();
    this.sentQueue = new Collection<string, boolean>();
    this.aliases = new Collection<string, string>();
    this.nplayingMsg = new Collection<
      string,
      { coll: InteractionCollector<ButtonInteraction<"cached">>; msg: Message }
    >();
    this.plButton = new Collection<string, PlayerButton>();
    this.leaveDelay = new Collection<string, NodeJS.Timeout>();
    this.nowPlaying = new Collection<string, { interval: NodeJS.Timeout; msg: GlobalMsg }>();
    this.wsl = new Collection<string, { send: (data: Record<string, unknown>) => void }>();
    this.isDatabaseConnected = false;

    // Sharing
    this.cluster = process.env.IS_SHARING == "true" ? new ClusterClient(this) : undefined;

    // Icons setup
    this.icons = this.config.bot.SAFE_ICONS_MODE ? SafeModeIcons : NormalModeIcons;

    process.on("unhandledRejection", (error) => this.logger.unhandled("AntiCrash", error));
    process.on("uncaughtException", (error) => this.logger.unhandled("AntiCrash", error));

    this.rainlink = new RainlinkInit(this).init;

    if (this.config.features.WEB_SERVER.enable) {
      new WebServer(this);
    }
    new DeployService(this);
    new initHandler(this);
    new DatabaseService(this);
  }

  protected configVolCheck(vol: number = this.config.lavalink.DEFAULT_VOLUME) {
    if (!vol || isNaN(vol) || vol > 100 || vol < 1) {
      this.config.lavalink.DEFAULT_VOLUME = 100;
      return false;
    }
    return true;
  }

  protected configSearchCheck(data: string[] = this.config.lavalink.AUTOCOMPLETE_SEARCH) {
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

  protected stringCheck(data: unknown) {
    if (typeof data === "string" || data instanceof String) return true;
    return false;
  }

  public getString(locale: string, section: string, key: string, args?: I18nArgs | undefined) {
    const currentString = this.i18n.get(locale, section, key, args);
    const locateErr = `Locale '${locale}' not found.`;
    const sectionErr = `Section '${section}' not found in locale '${locale}'`;
    const keyErr = `Key '${key}' not found in section ${section} in locale '${locale}'`;
    if (currentString == locateErr || currentString == sectionErr || currentString == keyErr) {
      return this.i18n.get("en", section, key, args);
    } else return currentString;
  }
}
