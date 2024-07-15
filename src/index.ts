import { Manager } from "./manager.js";
import { ConfigDataService } from "./services/ConfigDataService.js";

const configData = new ConfigDataService().data;
const byteblaze = new Manager(configData, configData.utilities.MESSAGE_CONTENT.enable);
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
