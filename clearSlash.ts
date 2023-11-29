import { REST } from "discord.js";
import { Routes } from "discord-api-types/v10";
import { ConfigDataService } from "./src/utils/config.js";
import { BotInfoType } from "./src/@types/User.js";

(async () => {
  const configData = new ConfigDataService().data;
  const rest = new REST({ version: "10" }).setToken(configData.bot.TOKEN);
  const client = await rest.get(Routes.user());

  rest.put(Routes.applicationCommands((client as BotInfoType).id), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
})();