import { REST } from "discord.js";
import { Routes } from "discord-api-types/v10";
import { ConfigDataService } from "./dist/utils/config.js";

(async () => {
  const configData = new ConfigDataService().data;
  const rest = new REST({ version: "10" }).setToken(configData.bot.TOKEN);
  const client = await rest.get(Routes.user());

  rest.put(Routes.applicationCommands(client.id), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
})();