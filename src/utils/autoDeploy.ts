import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
import chillout from "chillout";
import { makeSureFolderExists } from "stuffs";
import path from "path";
import readdirRecursive from "recursive-readdir";
import {
  ApplicationCommandOptionType,
  ApplicationCommandManager,
  ApplicationCommandDataResolvable,
} from "discord.js";
import {
  CommandInterface,
  UploadCommandInterface,
} from "../@types/Interaction.js";
import { join, dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

export class DeployService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async combineDir() {
    let store: CommandInterface[] = [];

    let interactionsFolder = path.resolve(
      join(__dirname, "..", "commands", "slash")
    );

    let contextsFolder = path.resolve(
      join(__dirname, "..", "commands", "context")
    );

    await makeSureFolderExists(interactionsFolder);
    await makeSureFolderExists(contextsFolder);

    let interactionFilePaths = await readdirRecursive(interactionsFolder);
    let contextFilePaths = await readdirRecursive(interactionsFolder);

    interactionFilePaths = interactionFilePaths.filter((i: string) => {
      let state = path.basename(i).startsWith("-");
      return !state;
    });

    contextFilePaths = contextFilePaths.filter((i: string) => {
      let state = path.basename(i).startsWith("-");
      return !state;
    });

    const fullPath = interactionFilePaths.concat(contextFilePaths)

    await chillout.forEach(
      fullPath,
      async (interactionFilePath: string) => {
        const cmd = (
          await import(pathToFileURL(interactionFilePath).toString())
        ).default;
        return store.push(cmd);
      }
    );

    return store
  }

  async execute() {
    let command = [];

    if (!this.client.config.features.AUTO_DEPLOY)
      return this.client.logger.info(
        "Auto deploy disabled. Exiting auto deploy..."
      );

    this.client.logger.info(
      "Auto deploy enabled. Reading interaction files..."
    );

    const store = await this.combineDir()

    command = this.parseEngine(store);

    if (command.length === 0)
      return this.client.logger.info(
        "No interactions loaded. Exiting auto deploy..."
      );
    await this.client.application!.commands.set(
      command as ApplicationCommandDataResolvable[]
    );
    this.client.logger.info(`Interactions deployed! Exiting auto deploy...`);
  }

  parseEngine(store: CommandInterface[]) {
    return store.reduce(
      (all: UploadCommandInterface[], current: CommandInterface) => {
        switch (current.name.length) {
          case 1: {
            all.push({
              type: current.type,
              name: current.name[0],
              description: current.description,
              defaultPermission: current.defaultPermission,
              options: current.options,
            });
            break;
          }
          case 2: {
            let baseItem = all.find((i: UploadCommandInterface) => {
              return i.name == current.name[0] && i.type == current.type;
            });
            if (!baseItem) {
              all.push({
                type: current.type,
                name: current.name[0],
                description: `${current.name[0]} commands.`,
                defaultPermission: current.defaultPermission,
                options: [
                  {
                    type: ApplicationCommandOptionType.Subcommand,
                    description: current.description,
                    name: current.name[1],
                    options: current.options,
                  },
                ],
              });
            } else {
              baseItem.options!.push({
                type: ApplicationCommandOptionType.Subcommand,
                description: current.description,
                name: current.name[1],
                options: current.options,
              });
            }
            break;
          }
          case 3:
            {
              let SubItem = all.find((i: UploadCommandInterface) => {
                return i.name == current.name[0] && i.type == current.type;
              });
              if (!SubItem) {
                all.push({
                  type: current.type,
                  name: current.name[0],
                  description: `${current.name[0]} commands.`,
                  defaultPermission: current.defaultPermission,
                  options: [
                    {
                      type: ApplicationCommandOptionType.SubcommandGroup,
                      description: `${current.name[1]} commands.`,
                      name: current.name[1],
                      options: [
                        {
                          type: ApplicationCommandOptionType.Subcommand,
                          description: current.description,
                          name: current.name[2],
                          options: current.options,
                        },
                      ],
                    },
                  ],
                });
              } else {
                let GroupItem = SubItem.options!.find(
                  (i: UploadCommandInterface) => {
                    return (
                      i.name == current.name[1] &&
                      i.type == ApplicationCommandOptionType.SubcommandGroup
                    );
                  }
                );
                if (!GroupItem) {
                  SubItem.options!.push({
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    description: `${current.name[1]} commands.`,
                    name: current.name[1],
                    options: [
                      {
                        type: ApplicationCommandOptionType.Subcommand,
                        description: current.description,
                        name: current.name[2],
                        options: current.options,
                      },
                    ],
                  });
                } else {
                  GroupItem.options!.push({
                    type: ApplicationCommandOptionType.Subcommand,
                    description: current.description,
                    name: current.name[2],
                    options: current.options,
                  });
                }
              }
            }
            break;
        }
        return all;
      },
      []
    );
  }
}
