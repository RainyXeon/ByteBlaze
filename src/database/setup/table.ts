import { IDriver, QuickDB } from "dreamvast.quick.db";
import { Manager } from "../../manager.js";
import { Handler } from "../handler.js";
// Schema
import { AutoReconnect } from "../schema/AutoReconnect.js";
import { Playlist } from "../schema/Playlist.js";
import { Code } from "../schema/Code.js";
import { Premium } from "../schema/Premium.js";
import { Setup } from "../schema/Setup.js";
import { Language } from "../schema/Language.js";
import { Status } from "../schema/Status.js";
import { Prefix } from "../schema/Prefix.js";
import { SongNoti } from "../schema/SongNoti.js";
import { QuickDatabasePlus } from "../../structures/QuickDatabasePlus.js";

export class TableSetup {
  client: Manager;
  driver: IDriver;
  driverName: string;
  constructor(client: Manager, driver: IDriver, driverName: string) {
    this.client = client;
    this.driver = driver;
    this.driverName = driverName;
    this.register();
  }

  async register() {
    const baseDB = new QuickDatabasePlus({ driver: this.driver });

    const start = Date.now();
    await baseDB.init();
    const end = Date.now();

    this.client.logger.info("DatabaseService", `Connected to the database! [${this.driverName}] [${end - start}ms]`);

    this.client.db = {
      autoreconnect: await baseDB.table<AutoReconnect>("autoreconnect"),
      playlist: await baseDB.table<Playlist>("playlist"),
      code: await baseDB.table<Code>("code"),
      premium: await baseDB.table<Premium>("premium"),
      setup: await baseDB.table<Setup>("setup"),
      language: await baseDB.table<Language>("language"),
      status: await baseDB.table<Status>("status"),
      prefix: await baseDB.table<Prefix>("prefix"),
      songNoti: await baseDB.table<SongNoti>("songNoti"),
      preGuild: await baseDB.table<Premium>("preGuild")
    };

    this.client.isDatabaseConnected = true;
    new Handler(this.client);
  }
}
