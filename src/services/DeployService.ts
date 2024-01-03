import { fileURLToPath, pathToFileURL } from "url";
import { Manager } from "../manager.js";
import chillout from "chillout";
import { makeSureFolderExists } from "stuffs";
import path from "path";
import readdirRecursive from "recursive-readdir";
import { ApplicationCommandOptionType, REST } from "discord.js";
import {
  CommandInterface,
  UploadCommandInterface,
} from "../@types/Interaction.js";
import { join, dirname } from "path";
import { Routes } from "discord-api-types/v10";
import { BotInfoType } from "../@types/User.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class DeployService {
  client: Manager;
  constructor(client: Manager) {
    this.client = client;
    this.execute();
  }

  async combineDir() {
    let store: CommandInterface[] = [];

    let interactionsFolder = path.resolve(join(__dirname, "..", "commands"));

    await makeSureFolderExists(interactionsFolder);

    let interactionFilePaths = await readdirRecursive(interactionsFolder);

    interactionFilePaths = interactionFilePaths.filter((i: string) => {
      let state = path.basename(i).startsWith("-");
      return !state;
    });

    await chillout.forEach(
      interactionFilePaths,
      async (interactionFilePath: string) => {
        const cmd = new (
          await import(pathToFileURL(interactionFilePath).toString())
        ).default();
        cmd.usingInteraction ? store.push(cmd) : true;
        return;
      }
    );

    return store;
  }

  async execute() {
    let command = [];

    this.client.logger.deploy_slash("Reading interaction files...");

    const store = await this.combineDir();

    command = this.parseEngine(store);

    this.client.logger.deploy_slash(
      "Reading interaction files completed, setting up REST..."
    );

    const rest = new REST({ version: "10" }).setToken(
      this.client.config.bot.TOKEN
    );
    const client = await rest.get(Routes.user());

    this.client.logger.deploy_slash(
      `Setting up REST completed! Account information received! ${
        (client as BotInfoType).username
      }#${(client as BotInfoType).discriminator} (${
        (client as BotInfoType).id
      })`
    );

    if (command.length === 0)
      return this.client.logger.deploy_slash(
        "No interactions loaded. Exiting auto deploy..."
      );

    await rest.put(Routes.applicationCommands((client as BotInfoType).id), {
      body: command,
    });

    this.client.logger.deploy_slash(
      `Interactions deployed! Exiting auto deploy...`
    );
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
