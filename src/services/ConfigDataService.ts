import { load } from "js-yaml";
import { YAMLParseService } from "./YAMLParseService.js";
import { config } from "dotenv";
import { Config } from "../@types/Config.js";
config();

export class ConfigDataService {
  get data() {
    const yaml_files = new YAMLParseService("./app.yml").execute();

    const raw = load(yaml_files) as Config;

    this.checkConfig(raw);

    const res = this.mergeDefault(this.defaultConfig, raw);

    if (process.env.DOCKER_COMPOSE_MODE) {
      // Change lavalink data
      const lavalink_changedata = res.lavalink.NODES[0];
      lavalink_changedata.url = String(process.env.NODE_URL);
      lavalink_changedata.name = "node_1";
      lavalink_changedata.auth = String(process.env.NODE_AUTH);
      lavalink_changedata.secure = false;

      if (process.env.DOCKER_COMPOSE_DATABASE) {
        // Change db data
        const db_chnagedata = res.features.DATABASE;
        if (db_chnagedata.driver == "mongodb") {
          db_chnagedata.config.uri = String(process.env.MONGO_URI);
        }
      }
    }

    return res;
  }

  checkConfig(res?: Config) {
    if (!res) throw new Error("Config file not contains any config, please check app.example.yml for example");
    if (!res.bot)
      throw new Error("Config file not contains bot config field, please check app.example.yml for example");
    if (!res.lavalink)
      throw new Error("Config file not contains lavalink config field, please check app.example.yml for example");
    if (!res.bot.OWNER_ID)
      throw new Error("Config file not contains OWNER_ID, please check app.example.yml for example");
    if (!res.bot.TOKEN) throw new Error("Config file not contains TOKEN, please check app.example.yml for example");
    if (!res.lavalink.NODES || res.lavalink.NODES.length == 0)
      throw new Error("Config file not contains NODES, please check app.example.yml for example");
  }

  mergeDefault<T extends { [key: string]: any }>(def: T, given: T): Required<T> {
    if (!given) return def as Required<T>;
    const defaultKeys: (keyof T)[] = Object.keys(def);
    for (const key in given) {
      if (defaultKeys.includes(key)) continue;
      if (this.isNumber(key)) continue;
      delete given[key];
    }
    for (const key of defaultKeys) {
      if (Array.isArray(given[key]) && given[key] !== null && given[key] !== undefined) {
        if (given[key].length == 0) given[key] = def[key];
      }
      if (def[key] === null || (typeof def[key] === "string" && def[key].length === 0)) {
        if (!given[key]) given[key] = def[key];
      }
      if (given[key] === null || given[key] === undefined) given[key] = def[key];
      if (typeof given[key] === "object" && given[key] !== null) {
        this.mergeDefault(def[key], given[key]);
      }
    }
    return given as Required<T>;
  }

  isNumber(data: string): boolean {
    return /^[+-]?\d+(\.\d+)?$/.test(data);
  }

  get defaultConfig(): Config {
    return {
      bot: {
        TOKEN: "",
        OWNER_ID: "",
        EMBED_COLOR: "#2B2D31",
        LANGUAGE: "en",
        LIMIT_TRACK: 50,
        LIMIT_PLAYLIST: 20,
        SAFE_ICONS_MODE: false,
        SAFE_PLAYER_MODE: true,
        DELETE_MSG_TIMEOUT: 3000,
        DEBUG_MODE: false,
      },
      lavalink: {
        SPOTIFY: {
          enable: false,
          id: "",
          secret: "",
        },
        AUTOCOMPLETE_SEARCH: ["yorushika", "yoasobi", "tuyu", "hinkik"],
        NP_REALTIME: false,
        LEAVE_TIMEOUT: 30000,
        NODES: [],
        DEFAULT_VOLUME: 100,
        AVOID_SUSPEND: true,
      },
      features: {
        DATABASE: {
          driver: "json",
          config: { path: "./cylane.database.json" },
        },
        MESSAGE_CONTENT: {
          enable: false,
          commands: {
            enable: false,
            prefix: "d!",
          },
        },
        AUTOFIX_LAVALINK: {
          enable: false,
          reconnectTries: 10,
          restTimeout: 3000,
        },
        WEB_SERVER: {
          enable: false,
          port: 2880,
          websocket: {
            enable: false,
            host: "localhost",
            secret: "Star the repo 💫",
            auth: false,
            trusted: [],
          },
        },
        PREMIUM_LOG_CHANNEL: "",
        GUILD_LOG_CHANNEL: "",
      },
    };
  }
}
