import { IDriver, QuickDB } from "quick.db";
import { Manager } from "../../manager.js";

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

export async function TableSetup(client: Manager, driver: IDriver) {
  const baseDB = new QuickDB({ driver: driver });
  await baseDB.init();

  client.db = {
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
}
