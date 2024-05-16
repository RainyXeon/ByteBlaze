import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve, relative } from "path";
import { Manager } from "../../manager.js";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { KeyCheckerEnum } from "../../@types/KeyChecker.js";
import { Command } from "../../structures/Command.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class CommandLoader {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.loader();
  }

  async loader() {
    let commandPath = resolve(join(__dirname, "..", "..", "commands"));
    let commandFiles = await readdirRecursive(commandPath);

    await chillout.forEach(commandFiles, async (commandFile) => {
      await this.register(commandFile);
    });

    if (this.client.commands.size) {
      this.client.logger.loader(CommandLoader.name, `${this.client.commands.size} Command Loaded!`);
    } else {
      this.client.logger.warn(CommandLoader.name, `No command loaded, is everything ok?`);
    }
  }

  async register(commandFile: string) {
    const rltPath = relative(__dirname, commandFile);
    const command = new (await import(pathToFileURL(commandFile).toString())).default();

    if (!command.name?.length) {
      this.client.logger.warn(CommandLoader.name, `"${rltPath}" The command file does not have a name. Skipping...`);
      return;
    }

    if (this.client.commands.has(command.name)) {
      this.client.logger.warn(CommandLoader.name, `"${command.name}" command has already been installed. Skipping...`);
      return;
    }

    const checkRes = this.keyChecker(command);

    if (checkRes !== KeyCheckerEnum.Pass) {
      this.client.logger.warn(
        CommandLoader.name,
        `"${command.name}" command is not implements correctly [${checkRes}]. Skipping...`
      );
      return;
    }

    this.client.commands.set(command.name.join("-"), command);

    if (command.aliases && command.aliases.length !== 0)
      command.aliases.forEach((a: string) => this.client.aliases.set(a, command.name.join("-")));
  }

  keyChecker(obj: Record<string, any>): KeyCheckerEnum {
    const base = new Command();
    const baseKeyArray = Object.keys(base);
    const check = Object.keys(obj);
    const checkedKey: string[] = [];

    if (baseKeyArray.length > check.length) return KeyCheckerEnum.MissingKey;
    if (baseKeyArray.length < check.length) return KeyCheckerEnum.TooMuchKey;
    if (obj.execute == undefined) return KeyCheckerEnum.NoRunFunction;

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
