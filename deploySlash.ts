import { pathToFileURL } from "url";
import { plsParseArgs } from "plsargs";
const args = plsParseArgs(process.argv.slice(2));
import chillout from "chillout";
import { makeSureFolderExists } from "stuffs";
import path from "path";
import readdirRecursive from "recursive-readdir";
import * as config from "./src/plugins/config.js";
import { ApplicationCommandOptionType, REST } from "discord.js";
import { Routes } from "discord-api-types/v10";
import {
  CommandInterface,
  UploadCommandInterface,
} from "./src/types/Interaction.js";
import { BotInfoType } from "./src/types/User.js";
(async () => {
  let command: UploadCommandInterface[] = [];

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

    let store: CommandInterface[] = [];

    console.log("Reading interaction files..");

    let interactionFilePaths = await readdirRecursive(interactionsFolder);
    interactionFilePaths = interactionFilePaths.filter((i) => {
      let state = path.basename(i).startsWith("-");
      return !state;
    });

    await chillout.forEach(
      interactionFilePaths,
      async (interactionFilePath) => {
        const cmd = (
          await import(pathToFileURL(interactionFilePath).toString())
        ).default;
        console.log(
          `Interaction "${
            cmd.type == "CHAT_INPUT"
              ? `/${cmd.name.join(" ")}`
              : `${cmd.name[0]}`
          }" ${cmd.name[1] || ""} ${
            cmd.name[2] || ""
          } added to the transform list!`
        );
        store.push(cmd);
      }
    );

    store = store.sort(
      (a: CommandInterface, b: CommandInterface) =>
        a.name.length - b.name.length
    );

    command = store.reduce(
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

    // command = command.map((i: RESTPostAPIApplicationCommandsJSONBody) =>{
    //   ApplicationCommandManager["transformCommand"](i)
    // }

    // )
  } else {
    console.info("No interactions read, all existing ones will be cleared...");
  }

  console.log("Total: " + command.length);

  const rest = new REST({ version: "10" }).setToken(config.default.bot.TOKEN);
  const client = await rest.get(Routes.user());

  console.info(
    `Account information received! ${(client as BotInfoType).username}#${
      (client as BotInfoType).discriminator
    } (${(client as BotInfoType).id})`
  );

  console.info(`Interactions are posted on discord!`);
  switch (deployed) {
    case "guild": {
      let guildId = args.get(1);
      console.info(`Deploy mode: guild (${guildId})`);

      await rest.put(
        Routes.applicationGuildCommands(
          (client as BotInfoType).id as string,
          guildId as string
        ),
        {
          body: command,
        }
      );

      console.info(`Shared commands may take 3-5 seconds to arrive.`);
      break;
    }
    case "global": {
      console.info(`Deploy mode: global`);

      await rest.put(Routes.applicationCommands((client as BotInfoType).id), {
        body: command,
      });

      console.info(
        `Shared commands can take up to 1 hour to arrive. If you want it to come immediately, you can throw your bot from your server and get it back.`
      );
      break;
    }
  }

  console.info(`Interactions shared!`);
})();
