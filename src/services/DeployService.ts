import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
import chillout from "chillout";
import { makeSureFolderExists } from "stuffs";
import path from "path";
import readdirRecursive from "recursive-readdir";
import { ApplicationCommandOptionType, REST, Routes } from "discord.js";
import { CommandInterface, UploadCommandInterface } from "../@types/Interaction.js";
import { join, dirname } from "path";
import { BotInfoType } from "../@types/User.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class DeployService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  protected async combineDir() {
    let store: CommandInterface[] = [];

    let interactionsFolder = path.resolve(join(__dirname, "..", "commands"));

    await makeSureFolderExists(interactionsFolder);

    let interactionFilePaths = await readdirRecursive(interactionsFolder);

    interactionFilePaths = interactionFilePaths.filter((i: string) => {
      let state = path.basename(i).startsWith("-");
      return !state;
    });

    await chillout.forEach(interactionFilePaths, async (interactionFilePath: string) => {
      const cmd = new (await import(pathToFileURL(interactionFilePath).toString())).default();
      cmd.usingInteraction ? store.push(cmd) : true;
      return;
    });

    return store;
  }

  async execute() {
    let command = [];

    this.client.logger.deploy(DeployService.name, "Reading interaction files...");

    const store = await this.combineDir();

    command = this.parseEngine(store);

    this.client.logger.deploy(DeployService.name, "Reading interaction files completed, setting up REST...");

    const rest = new REST({ version: "10" }).setToken(this.client.config.bot.TOKEN[this.client.clientIndex]);
    const client = await rest.get(Routes.user());

    this.client.logger.deploy(
      DeployService.name,
      `Setting up REST completed! Account information received! ${(client as BotInfoType).username}#${
        (client as BotInfoType).discriminator
      } (${(client as BotInfoType).id})`
    );

    if (command.length === 0)
      return this.client.logger.deploy(DeployService.name, "No interactions loaded. Exiting auto deploy...");

    await rest.put(Routes.applicationCommands((client as BotInfoType).id), {
      body: command,
    });

    this.client.logger.deploy(DeployService.name, `Interactions deployed! Exiting auto deploy...`);
  }

  protected parseEngine(store: CommandInterface[]) {
    return store.reduce(
      (all: UploadCommandInterface[], current: CommandInterface) => this.commandReducer(all, current),
      []
    );
  }

  protected commandReducer(all: UploadCommandInterface[], current: CommandInterface) {
    // Push single name command
    if (current.name.length == 1) all.push(this.singleCommandMaker(current));
    // Push double name command
    if (current.name.length == 2) {
      let baseItem = all.find((i: UploadCommandInterface) => {
        return i.name == current.name[0] && i.type == current.type;
      });
      if (!baseItem) all.push(this.doubleCommandMaker(current));
      else baseItem.options!.push(this.singleItemMaker(current, 1));
    }
    // Push trible name command
    if (current.name.length == 3) {
      let SubItem = all.find((i: UploadCommandInterface) => {
        return i.name == current.name[0] && i.type == current.type;
      });
      let GroupItem = SubItem
        ? SubItem.options!.find((i: UploadCommandInterface) => {
            return i.name == current.name[1] && i.type == ApplicationCommandOptionType.SubcommandGroup;
          })
        : undefined;

      if (!SubItem) {
        all.push(this.tribleCommandMaker(current));
      } else if (SubItem && !GroupItem) {
        SubItem.options!.push(this.doubleSubCommandMaker(current));
      } else if (SubItem && GroupItem) {
        GroupItem.options!.push(this.singleItemMaker(current, 2));
      }
    }

    // Return all
    return all;
  }

  protected singleCommandMaker(current: CommandInterface) {
    return {
      type: current.type,
      name: current.name[0],
      description: current.description,
      defaultPermission: current.defaultPermission,
      options: current.options,
    };
  }

  protected doubleCommandMaker(current: CommandInterface) {
    return {
      type: current.type,
      name: current.name[0],
      description: `${current.name[0]} commands.`,
      defaultPermission: current.defaultPermission,
      options: [this.singleItemMaker(current, 1)],
    };
  }

  protected singleItemMaker(current: CommandInterface, nameIndex: number) {
    return {
      type: ApplicationCommandOptionType.Subcommand,
      description: current.description,
      name: current.name[nameIndex],
      options: current.options,
    };
  }

  protected tribleCommandMaker(current: CommandInterface) {
    return {
      type: current.type,
      name: current.name[0],
      description: `${current.name[0]} commands.`,
      defaultPermission: current.defaultPermission,
      options: [
        {
          type: ApplicationCommandOptionType.SubcommandGroup,
          description: `${current.name[1]} commands.`,
          name: current.name[1],
          options: [this.singleItemMaker(current, 2)],
        },
      ],
    };
  }

  protected doubleSubCommandMaker(current: CommandInterface) {
    return {
      type: ApplicationCommandOptionType.SubcommandGroup,
      description: `${current.name[1]} commands.`,
      name: current.name[1],
      options: [this.singleItemMaker(current, 2)],
    };
  }
}
