import { Manager } from "../manager.js";
import chillout from "chillout";
import { makeSureFolderExists } from "stuffs";
import path from "path";
import readdirRecursive from "recursive-readdir";
import {
  ApplicationCommandOptionType,
  ApplicationCommandManager,
} from "discord.js";

export async function Deploy(client: Manager) {
  let command = [];

  if (!client.config.features.AUTO_DEPLOY)
    return client.logger.info("Auto deploy disabled. Exiting auto deploy...");

  let interactionsFolder = path.resolve("./src/commands/slash");

  await makeSureFolderExists(interactionsFolder);

  let store: any = [];

  client.logger.info("Auto deploy enabled. Reading interaction files...");

  let interactionFilePaths = await readdirRecursive(interactionsFolder);

  interactionFilePaths = interactionFilePaths.filter((i: any) => {
    let state = path.basename(i).startsWith("-");
    return !state;
  });

  await chillout.forEach(interactionFilePaths, (interactionFilePath: any) => {
    const cmd = require(interactionFilePath);
    store.push(cmd);
  });

  store = store.sort((a: any, b: any) => a.name.length - b.name.length);
  command = store.reduce((all: any, current: any) => {
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
        let baseItem = all.find((i: any) => {
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
          baseItem.options.push({
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
          let SubItem = all.find((i: any) => {
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
            let GroupItem = SubItem.options.find((i: any) => {
              return (
                i.name == current.name[1] &&
                i.type == ApplicationCommandOptionType.SubcommandGroup
              );
            });
            if (!GroupItem) {
              SubItem.options.push({
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
              GroupItem.options.push({
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
  }, []);

  if (command.length === 0)
    return client.logger.info("No interactions loaded. Exiting auto deploy...");
  await client.application!.commands.set(command);
  client.logger.info(`Interactions deployed! Exiting auto deploy...`);
}
