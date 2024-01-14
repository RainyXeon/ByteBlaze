import { QuickDB } from "dreamvast.quick.db";
import { AutoReconnect } from "./schema/AutoReconnect.js";
import { Playlist } from "./schema/Playlist.js";
import { Code } from "./schema/Code.js";
import { Premium } from "./schema/Premium.js";
import { Setup } from "./schema/Setup.js";
import { Language } from "./schema/Language.js";
import { Status } from "./schema/Status.js";
import { Prefix } from "./schema/Prefix.js";
import { SongNoti } from "./schema/SongNoti.js";

export interface DatabaseTable {
  autoreconnect: QuickDB<AutoReconnect>;
  playlist: QuickDB<Playlist>;
  code: QuickDB<Code>;
  premium: QuickDB<Premium>;
  setup: QuickDB<Setup>;
  language: QuickDB<Language>;
  status: QuickDB<Status>;
  prefix: QuickDB<Prefix>;
  songNoti: QuickDB<SongNoti>;
}
