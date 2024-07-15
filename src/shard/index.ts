import { ClusterManager } from "discord-hybrid-sharding";
import { ConfigDataService } from "../services/ConfigDataService.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const configData = new ConfigDataService().data;
process.env.IS_SHARING = "true";

const token = configData.bot.TOKEN;
const manager = new ClusterManager(join(__dirname, "bootloader.js"), {
  totalShards: "auto",
  shardsPerClusters: 3,
  totalClusters: "auto",
  mode: "worker",
  token: token,
});

manager.on("clusterCreate", (cluster) => {
  console.log(`Launched Cluster ${cluster.id}`);
});
manager.spawn({ timeout: -1 }).catch((err) => console.log(err));
