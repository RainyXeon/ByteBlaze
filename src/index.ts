import { Manager } from "./manager.js";
import { ConfigDataService } from "./services/ConfigDataService.js";
const configData = new ConfigDataService().data;
configData.bot.TOKEN.forEach((token, index) => {
  const byteblaze = new Manager(configData, index, configData.utilities.MESSAGE_CONTENT.enable);
  // Anti crash handling
  process
    .on("unhandledRejection", (error) => byteblaze.logger.unhandled("AntiCrash", error))
    .on("uncaughtException", (error) => byteblaze.logger.unhandled("AntiCrash", error))
    .on("uncaughtExceptionMonitor", (error) => byteblaze.logger.unhandled("AntiCrash", error))
    .on("exit", () =>
      byteblaze.logger.info("ClientManager", `Successfully Powered Off ByteBlaze, Good Bye!`)
    )
    .on("SIGINT", () => {
      byteblaze.logger.info("ClientManager", `Powering Down ByteBlaze...`);
      process.exit(0);
    });
  byteblaze.start();
  byteblaze.login(token);
});
