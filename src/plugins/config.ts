import { load } from "js-yaml";
import { prase } from "./prase/index.js";
import { config } from "dotenv";
config();
let doc;

const yaml_files = prase("./app.yml");

try {
  const res = load(yaml_files);
  doc = res as Record<string, any>;
  if (process.env.DOCKER_COMPOSE_MODE) {
    // Change lavalink data
    const lavalink_changedata = doc.lavalink.NODES[0];
    lavalink_changedata.url = process.env.NODE_URL;
    lavalink_changedata.name = process.env.NODE_URL;
    lavalink_changedata.auth = process.env.NODE_AUTH;
    lavalink_changedata.secure = false;

    // Change bot data
    const bot_chagedata = doc.bot;
    bot_chagedata.TOKEN = process.env.TOKEN;

    // Change db data
    const db_chnagedata = doc.features.DATABASE.MONGO_DB;
    if (db_chnagedata.enable) {
      db_chnagedata.uri = process.env.MONGO_URI;
    }
  }
} catch (e) {
  console.log(e);
}

export default doc;
