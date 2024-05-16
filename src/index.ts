import { Manager } from "./manager.js";
import { ConfigDataService } from "./services/ConfigDataService.js";
const configData = new ConfigDataService().data;
configData.bot.TOKEN.forEach((token, index) => {
  new Manager(configData, index, configData.features.MESSAGE_CONTENT.enable).login(token);
});
