import { plsParseArgs } from "plsargs";
const args = plsParseArgs(process.argv.slice(2));
import chillout from "chillout";
import { makeSureFolderExists } from "stuffs";
import path from "path";
import readdirRecursive from "recursive-readdir";
import config from "./src/plugins/config.js";
import {
  ApplicationCommandOptionType,
  REST,
  ApplicationCommandManager,
} from "discord.js";
import { Routes } from "discord-api-types/v10";

(async () => {
  let command: any = [];

  let cleared =
    args.get(0) == "guild"
      ? args.get(2) == "clear"
      : args.get(0) == "global"
      ? args.get(1) == "clear"
      : false;
  let deployed =
    args.get(0) == "guild"
      ? "guild"
      : args.get(0) == "global"
      ? "global"
      : null;

  if (!deployed) {
    console.error(`Invalid sharing mode! Valid modes: guild, global`);
    console.error(`Usage example: node deploySlash.js guild <guildId> [clear]`);
    console.error(`Usage example: node deploySlash.js global [clear]`);
    return process.exit(1);
  }

  if (!cleared) {
    let interactionsFolder = path.resolve("./src/commands/slash");

    await makeSureFolderExists(interactionsFolder);

    let store: any = [];

    console.log("Reading interaction files..");

    let interactionFilePaths = await readdirRecursive(interactionsFolder);
    interactionFilePaths = interactionFilePaths.filter((i) => {
      let state = path.basename(i).startsWith("-");
      return !state;
    });

    await chillout.forEach(interactionFilePaths, (interactionFilePath) => {
      const cmd = require(interactionFilePath);
      console.log(
        `Interaction "${
          cmd.type == "CHAT_INPUT" ? `/${cmd.name.join(" ")}` : `${cmd.name[0]}`
        }" ${cmd.name[1] || ""} ${
          cmd.name[2] || ""
        } added to the transform list!`,
      );
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

    command = command.map((i: any) =>
      ApplicationCommandManager["transformCommand"](i),
    );
  } else {
    console.info("No interactions read, all existing ones will be cleared...");
  }

  console.log(command.length);

  const rest = new REST({ version: "10" }).setToken(config.bot.TOKEN);
  const client = await rest.get(Routes.user());
  console.info(
    `Account information received! ${(client as any).username}#${
      (client as any).discriminator
    } (${(client as any).id})`,
  );

  console.info(`Interactions are posted on discord!`);
  switch (deployed) {
    case "guild": {
      let guildId = args.get(1);
      console.info(`Deploy mode: guild (${guildId})`);

      await rest.put(
        Routes.applicationGuildCommands(
          (client as any).id as string,
          guildId as string,
        ),
        {
          body: command,
        },
      );

      console.info(`Shared commands may take 3-5 seconds to arrive.`);
      break;
    }
    case "global": {
      console.info(`Deploy mode: global`);

      await rest.put(Routes.applicationCommands((client as any).id), {
        body: command,
      });

      console.info(
        `Shared commands can take up to 1 hour to arrive. If you want it to come immediately, you can throw your bot from your server and get it back.`,
      );
      break;
    }
  }

  console.info(`Interactions shared!`);
})();
