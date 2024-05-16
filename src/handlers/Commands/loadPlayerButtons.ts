import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve, relative } from "path";
import { Manager } from "../../manager.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { KeyCheckerEnum } from "../../@types/KeyChecker.js";
import { PlayerButton } from "../../@types/Button.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class PlayerButtonsLoader {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader();
  }

  async loader() {
    let commandPath = resolve(join(__dirname, "..", "..", "buttons"));
    let commandFiles = await readdirRecursive(commandPath);

    await chillout.forEach(commandFiles, async (commandFile) => {
      await this.register(commandFile);
    });

    if (this.client.plButton.size) {
      this.client.logger.loader(PlayerButtonsLoader.name, `${this.client.plButton.size} player buttons Loaded!`);
    } else {
      this.client.logger.warn(PlayerButtonsLoader.name, `No player button loaded, is everything ok?`);
    }
  }

  async register(commandFile: string) {
    const rltPath = relative(__dirname, commandFile);
    const command = new (await import(pathToFileURL(commandFile).toString())).default();

    if (!command.name?.length) {
      this.client.logger.warn(
        PlayerButtonsLoader.name,
        `"${rltPath}" The player button file does not have a name. Skipping...`
      );
      return;
    }

    if (this.client.plButton.has(command.name)) {
      this.client.logger.warn(
        PlayerButtonsLoader.name,
        `"${command.name}" player button has already been installed. Skipping...`
      );
      return;
    }

    const checkRes = this.keyChecker(command);

    if (checkRes !== KeyCheckerEnum.Pass) {
      this.client.logger.warn(
        PlayerButtonsLoader.name,
        `"${command.name}" player button is not implements correctly [${checkRes}]. Skipping...`
      );
      return;
    }

    this.client.plButton.set(command.name, command);
  }

  keyChecker(obj: Record<string, any>): KeyCheckerEnum {
    const base = new PlayerButton();
    const baseKeyArray = Object.keys(base);
    const check = Object.keys(obj);
    const checkedKey: string[] = [];

    if (baseKeyArray.length > check.length) return KeyCheckerEnum.MissingKey;
    if (baseKeyArray.length < check.length) return KeyCheckerEnum.TooMuchKey;
    if (obj.run == undefined) return KeyCheckerEnum.NoRunFunction;

    try {
      for (let i = 0; i < check.length; i++) {
        if (checkedKey.includes(check[i])) return KeyCheckerEnum.DuplicateKey;
        if (!(check[i] in base)) return KeyCheckerEnum.InvalidKey;
        checkedKey.push(check[i]);
      }
    } finally {
      checkedKey.length = 0;
      return KeyCheckerEnum.Pass;
    }
  }
}
