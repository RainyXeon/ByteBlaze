import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve, relative } from "path";
import { Manager } from "../../manager.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { ContextCommand } from "../../@types/Command.js";
import { KeyCheckerEnum } from "../../@types/KeyChecker.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class loadContextCommands {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader();
  }

  async loader() {
    let commandPath = resolve(
      join(__dirname, "..", "..", "commands", "context")
    );
    let commandFiles = await readdirRecursive(commandPath);

    if (commandFiles.length > 5)
      return this.client.logger.warn(
        `Too much context commands, only 5 contexts command can be registered. Skipping.....`
      );

    await chillout.forEach(commandFiles, async (commandFile) => {
      await this.register(commandFile);
    });

    if (this.client.slash.size) {
      this.client.logger.loader(
        `${commandFiles.length} Contexts Command Loaded!`
      );
    } else {
      this.client.logger.warn(`No Contexts command loaded, is everything ok?`);
    }
  }

  async register(commandFile: string) {
    const rltPath = relative(__dirname, commandFile);
    const command = new (
      await import(pathToFileURL(commandFile).toString())
    ).default();

    if (command.name.length > 3) {
      this.client.logger.warn(
        `"${rltPath}" The name list of the context interaction file is too long. (>3) Skipping..`
      );
      return;
    }

    if (!command.name?.length) {
      this.client.logger.warn(
        `"${rltPath}" The context interaction file does not have a name. Skipping..`
      );
      return;
    }

    if (this.client.slash.has(command.name)) {
      this.client.logger.warn(
        `"${command.name[1]}" context interaction has already been installed. It's skipping.`
      );
      return;
    }

    this.client.slash.set(command.name, command);

    const checkRes = this.keyChecker(command);

    if (checkRes !== KeyCheckerEnum.Pass) {
      this.client.logger.warn(
        `"${command.name}" context command is not implements correctly [${checkRes}]. Skipping...`
      );
      return;
    }

    this.client.slash.set(command.name, command);
  }

  keyChecker(obj: Record<string, any>): KeyCheckerEnum {
    const base = new ContextCommand();
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
