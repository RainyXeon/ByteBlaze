import { load } from 'js-yaml'
import { YAMLParseService } from './YAMLParseService.js'
import { config } from 'dotenv'
import { Config } from '../@types/Config.js'
config()

export class ConfigDataService {
  get data() {
    const yaml_files = load(new YAMLParseService('./app.yml').execute()) as Config
    const old_data = load(new YAMLParseService('./app.yml').execute()) as Config

    const raw = yaml_files
    this.checkConfig(raw)
    const res = this.mergeDefault(this.defaultConfig, raw)

    if (old_data.utilities && old_data.utilities.DATABASE && old_data.utilities.DATABASE.config) {
      res.utilities.DATABASE.config = old_data.utilities.DATABASE.config
    }

    if (process.env.DOCKER_COMPOSE_MODE) {
      // Change lavalink data
      const lavalink_changedata = res.player.NODES[0]
      lavalink_changedata.host = String(process.env.NODE_HOST)
      lavalink_changedata.port = Number(process.env.NODE_PORT)
      lavalink_changedata.name = 'node_1'
      lavalink_changedata.auth = String(process.env.NODE_AUTH)
      lavalink_changedata.secure = false

      if (process.env.DOCKER_COMPOSE_DATABASE) {
        // Change db data
        const db_chnagedata = res.utilities.DATABASE
        if (db_chnagedata.driver == 'mongodb') {
          db_chnagedata.config.uri = String(process.env.MONGO_URI)
        }
      }
    }

    return res
  }

  checkConfig(res?: Config) {
    if (!res)
      throw new Error(
        'Config file not contains any config, please check app.example.yml for example'
      )
    if (!res.bot)
      throw new Error(
        'Config file not contains bot config field, please check app.example.yml for example'
      )
    if (!res.player)
      throw new Error(
        'Config file not contains lavalink config field, please check app.example.yml for example'
      )
    if (!res.bot.OWNER_ID)
      throw new Error('Config file not contains OWNER_ID, please check app.example.yml for example')
    if (!res.bot.TOKEN || res.bot.TOKEN.length == 0)
      throw new Error('Config file not contains TOKEN, please check app.example.yml for example')
    if (typeof res.bot.TOKEN !== 'string')
      throw new Error('TOKEN field not in string, please check app.example.yml for example')
    if (!res.player.NODES || res.player.NODES.length == 0)
      throw new Error('Config file not contains NODES, please check app.example.yml for example')
  }

  // Modded from:
  // https://github.com/shipgirlproject/Shoukaku/blob/2677ecdf123ffef1c254c2113c5342b250ac4396/src/Utils.ts#L9-L23
  mergeDefault<T extends { [key: string]: any }>(def: T, given: T): Required<T> {
    if (!given) return def as Required<T>
    const defaultKeys: (keyof T)[] = Object.keys(def)
    for (const key in given) {
      if (defaultKeys.includes(key)) continue
      if (this.isNumber(key)) continue
      delete given[key]
    }
    for (const key of defaultKeys) {
      if (Array.isArray(given[key]) && given[key].length == 0) given[key] = def[key]
      if (def[key] === null || (typeof def[key] === 'string' && def[key].length === 0)) {
        if (!given[key]) given[key] = def[key]
      }
      if (given[key] === null || given[key] === undefined) given[key] = def[key]
      if (typeof given[key] === 'object' && given[key] !== null) {
        this.mergeDefault(def[key], given[key])
      }
      if (typeof given[key] !== typeof def[key]) if (!given[key]) given[key] = def[key]
    }
    return given as Required<T>
  }

  isNumber(data: string): boolean {
    return /^[+-]?\d+(\.\d+)?$/.test(data)
  }

  get defaultConfig(): Config {
    return {
      bot: {
        TOKEN: '',
        OWNER_ID: '',
        EMBED_COLOR: '#2B2D31',
        LANGUAGE: 'en',
        DEBUG_MODE: false,
        ADMIN: [],
      },
      player: {
        SPOTIFY: {
          enable: false,
          id: '',
          secret: '',
        },
        AUTOCOMPLETE_SEARCH: ['yorushika', 'yoasobi', 'tuyu', 'hinkik'],
        NP_REALTIME: false,
        LEAVE_TIMEOUT: 30000,
        NODES: [],
        DEFAULT_VOLUME: 100,
        AVOID_SUSPEND: false,
        LIMIT_TRACK: 50,
        LIMIT_PLAYLIST: 20,
      },
      utilities: {
        AUTO_RESUME: false,
        TOPGG_TOKEN: '',
        DELETE_MSG_TIMEOUT: 2000,
        SHARDING_SYSTEM: {
          shardsPerClusters: 2,
          totalClusters: 2,
        },
        DATABASE: {
          driver: 'json',
          config: { path: './cylane.database.json' },
          cacheCleanSchedule: '0 */30 * * * *',
        },
        MESSAGE_CONTENT: {
          enable: true,
          commands: {
            enable: true,
            prefix: 'd!',
          },
        },
        AUTOFIX_LAVALINK: {
          enable: true,
          retryCount: 10,
          retryTimeout: 3000,
        },
        WEB_SERVER: {
          host: '0.0.0.0',
          enable: false,
          port: 2880,
          auth: 'youshallnotpass',
          whitelist: [],
        },
        PREMIUM_LOG_CHANNEL: '',
        GUILD_LOG_CHANNEL: '',
        LOG_CHANNEL: '',
      },
      emojis: {
        PLAYER: {
          play: '▶️',
          pause: '⏸️',
          loop: '🔁',
          shuffle: '🔀',
          stop: '⏹️',
          skip: '⏩',
          previous: '⏪',
          voldown: '🔉',
          volup: '🔊',
          queue: '📋',
          delete: '🗑',
        },
        GLOBAL: {
          arrow_next: '➡',
          arrow_previous: '⬅',
        },
      },
    }
  }
}
