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

export function TableSetup(client: Manager, driver: IDriver) {
  client.db = {
    autoreconnect: new QuickDB<AutoReconnect>({
      driver: driver,
      table: "autoreconnect",
    }),
    playlist: new QuickDB<Playlist>({ driver: driver, table: "playlist" }),
    code: new QuickDB<Code>({ driver: driver, table: "code" }),
    premium: new QuickDB<Premium>({ driver: driver, table: "premium" }),
    control: new QuickDB<Control>({ driver: driver, table: "control" }),
    setup: new QuickDB<Setup>({ driver: driver, table: "setup" }),
    language: new QuickDB<Language>({ driver: driver, table: "language" }),
    status: new QuickDB<Status>({ driver: driver, table: "status" }),
    prefix: new QuickDB<Prefix>({ driver: driver, table: "prefix" }),
  };
}
