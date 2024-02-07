import { load } from "js-yaml";
import { YAMLParseService } from "./YAMLParseService.js";
import { config } from "dotenv";
import { Config } from "../@types/Config.js";
config();

export class ConfigDataService {
  get data() {
    const yaml_files = new YAMLParseService("./app.yml").execute();

    const res = load(yaml_files) as Config;

    if (process.env.DOCKER_COMPOSE_MODE) {
      // Change lavalink data
      const lavalink_changedata = res.lavalink.NODES[0];
      lavalink_changedata.url = String(process.env.NODE_URL);
      lavalink_changedata.name = String(process.env.NODE_URL);
      lavalink_changedata.auth = String(process.env.NODE_AUTH);
      lavalink_changedata.secure = false;

      // Change db data
      const db_chnagedata = res.features.DATABASE;
      if (db_chnagedata.driver == "mongodb") {
        db_chnagedata.config.uri = String(process.env.MONGO_URI);
      }
    }

    return res;
  }
}
