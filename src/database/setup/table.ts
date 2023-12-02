import { IDriver, QuickDB } from "dreamvast.quick.db";
import { Manager } from "../../manager.js";
import { Handler } from "../handler.js";
// Schema
import { AutoReconnect } from "../schema/AutoReconnect.js";
import { Playlist } from "../schema/Playlist.js";
import { Code } from "../schema/Code.js";
import { Premium } from "../schema/Premium.js";
import { Control } from "../schema/Control.js";
import { Setup } from "../schema/Setup.js";
import { Language } from "../schema/Language.js";
import { Status } from "../schema/Status.js";
import { Prefix } from "../schema/Prefix.js";

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
    const baseDB = new QuickDB({ driver: this.driver });

    const start = Date.now();
    await baseDB.init();
    const end = Date.now();

    this.client.logger.info(
      `Connected to the database! [${this.driverName}] [${end - start}ms]`
    );

    this.client.db = {
      autoreconnect: await baseDB.table<AutoReconnect>("autoreconnect"),
      playlist: await baseDB.table<Playlist>("playlist"),
      code: await baseDB.table<Code>("code"),
      premium: await baseDB.table<Premium>("premium"),
      control: await baseDB.table<Control>("control"),
      setup: await baseDB.table<Setup>("setup"),
      language: await baseDB.table<Language>("language"),
      status: await baseDB.table<Status>("status"),
      prefix: await baseDB.table<Prefix>("prefix"),
    };

    this.client.is_db_connected = true;
    new Handler(this.client);
  }
}
