import {
  Client,
  GatewayIntentBits,
  ColorResolvable,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  Collection as DJSCollection,
  InteractionCollector,
  ButtonInteraction,
  StringSelectMenuOptionBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { DatabaseService } from "./database/index.js";
import { resolve } from "path";
import { LoggerService } from "./services/LoggerService.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { WebServer } from "./web/server.js";
import { ManifestService } from "./services/ManifestService.js";
import { config } from "dotenv";
import { initHandler } from "./handlers/index.js";
import { DeployService } from "./services/DeployService.js";
import { RainlinkInit } from "./structures/Rainlink.js";
import { Metadata } from "./@types/Metadata.js";
import { Config, Emojis } from "./@types/Config.js";
import { DatabaseTable } from "./database/@types.js";
import { LavalinkDataType, LavalinkUsingDataType } from "./@types/Lavalink.js";
import { Rainlink } from "./rainlink/Rainlink.js";
import { Command } from "./structures/Command.js";
import { PlayerButton } from "./@types/Button.js";
import { GlobalMsg } from "./structures/CommandHandler.js";
import { RainlinkFilterData, RainlinkPlayer } from "./rainlink/main.js";
import { TopggService } from "./services/TopggService.js";
import { Collection } from "./structures/Collection.js";
import { Localization } from "./structures/Localization.js";
config();

export class Manager extends Client {
  public metadata: Metadata;
  public logger: LoggerService;
  public db!: DatabaseTable;
  public owner: string;
  public color: ColorResolvable;
  public i18n: Localization;
  public prefix: string;
  public isDatabaseConnected: boolean;
  public lavalinkList: LavalinkDataType[];
  public lavalinkUsing: LavalinkUsingDataType[];
  public lavalinkUsed: LavalinkUsingDataType[];
  public rainlink: Rainlink;
  public commands: DJSCollection<string, Command>;
  public interval: Collection<NodeJS.Timer>;
  public sentQueue: Collection<boolean>;
  public nplayingMsg: Collection<{
    filterColl: InteractionCollector<StringSelectMenuInteraction<"cached">>;
    coll: InteractionCollector<ButtonInteraction<"cached">>;
    msg: Message;
  }>;
  public aliases: Collection<string>;
  public plButton: Collection<PlayerButton>;
  public leaveDelay: Collection<NodeJS.Timeout>;
  public nowPlaying: Collection<{ interval: NodeJS.Timeout; msg: GlobalMsg }>;
  public wsl: Collection<{ send: (data: Record<string, unknown>) => void }>;
  public UpdateMusic!: (player: RainlinkPlayer) => Promise<void | Message<true>>;
  public UpdateQueueMsg!: (player: RainlinkPlayer) => Promise<void | Message<true>>;
  public enSwitch!: ActionRowBuilder<ButtonBuilder>;
  public diSwitch!: ActionRowBuilder<ButtonBuilder>;
  public enSwitchMod!: ActionRowBuilder<ButtonBuilder>;
  public topgg?: TopggService;
  public icons: Emojis;
  public cluster?: ClusterClient<Client>;
  public REGEX: RegExp[];
  public selectMenuOptions: StringSelectMenuOptionBuilder[] = [];

  constructor(
    public config: Config,
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
        : [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
          ],
    });

    // Initial basic bot config
    const __dirname = dirname(fileURLToPath(import.meta.url));
    this.logger = new LoggerService(this);
    this.metadata = new ManifestService().data.metadata.bot;
    this.owner = this.config.bot.OWNER_ID;
    this.color = (this.config.bot.EMBED_COLOR || "#2b2d31") as ColorResolvable;
    this.i18n = new Localization({
      defaultLocale: this.config.bot.LANGUAGE || "en",
      directory: resolve(join(__dirname, "languages")),
    });
    this.prefix = this.config.utilities.MESSAGE_CONTENT.commands.prefix || "d!";
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

    // Initial autofix lavalink varibles
    this.lavalinkList = [];
    this.lavalinkUsing = [];
    this.lavalinkUsed = [];

    // Collections
    this.commands = new DJSCollection<string, Command>();
    this.interval = new Collection<NodeJS.Timer>();
    this.sentQueue = new Collection<boolean>();
    this.aliases = new Collection<string>();
    this.nplayingMsg = new Collection<{
      filterColl: InteractionCollector<StringSelectMenuInteraction<"cached">>;
      coll: InteractionCollector<ButtonInteraction<"cached">>;
      msg: Message;
    }>();
    this.plButton = new Collection<PlayerButton>();
    this.leaveDelay = new Collection<NodeJS.Timeout>();
    this.nowPlaying = new Collection<{ interval: NodeJS.Timeout; msg: GlobalMsg }>();
    this.wsl = new Collection<{ send: (data: Record<string, unknown>) => void }>();
    this.isDatabaseConnected = false;

    // Icons setup
    this.icons = this.config.emojis;

    this.cluster = process.env.IS_SHARING == "true" ? new ClusterClient(this) : undefined;

    this.rainlink = new RainlinkInit(this).init;
    for (const key of Object.keys(RainlinkFilterData)) {
      const firstUpperCase = key.charAt(0).toUpperCase() + key.slice(1);
      this.selectMenuOptions.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(firstUpperCase)
          .setDescription(
            key == "clear"
              ? "Reset all current filter"
              : `${firstUpperCase} filter for better audio experience!`
          )
          .setValue(key)
      );
    }
  }

  public start() {
    this.logger.info("ClientManager", `Booting byteblaze...`);
    this.logger.info("ClientManager", `├── Version: ${this.metadata.version}`);
    this.logger.info("ClientManager", `├── Codename: ${this.metadata.codename}`);
    this.logger.info("ClientManager", `└── Autofix Version: ${this.metadata.autofix}`);
    if (!this.config.player.AVOID_SUSPEND)
      this.logger.warn(
        "ClientManager",
        "You just disabled AVOID_SUSPEND feature. Enable this on app.yml to avoid discord suspend your bot!"
      );
    if (this.config.utilities.WEB_SERVER.enable) new WebServer(this);
    new DeployService(this);
    new initHandler(this);
    new DatabaseService(this);
    super.login(this.config.bot.TOKEN);
  }
}
