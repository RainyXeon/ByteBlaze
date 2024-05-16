import { ClusterManager } from "discord-hybrid-sharding";
import { ConfigDataService } from "../services/ConfigDataService.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const configData = new ConfigDataService().data;
process.env.IS_SHARING = "true";
let indexer = 0;

function start() {
  const token = configData.bot.TOKEN[indexer];
  let clusterId: null | number = null;
  process.env.BYTEBLAZE_CURRENT_INDEX = String(indexer);
  process.env.BYTEBLAZE_CURRENT_TOKEN = token;
  const manager = new ClusterManager(join(__dirname, "bootloader.js"), {
    totalShards: "auto",
    shardsPerClusters: 3,
    totalClusters: "auto",
    mode: "worker",
    token: token,
  });
  manager.on("clusterCreate", (cluster) => {
    clusterId = cluster.id;
    console.log(`Launched Cluster ${cluster.id} on bot#${indexer}`);
  });
  manager.spawn({ timeout: -1 }).catch((err) => console.log(err));
  manager.on("debug", (msg) => {
    if (msg == `[CM => Cluster ${String(clusterId)}] Ready`) {
      if (indexer + 1 !== configData.bot.TOKEN.length) {
        indexer = indexer + 1;
        start();
      }
    }
  });
}

try {
  start();
} catch (err) {
  console.log(err);
}
