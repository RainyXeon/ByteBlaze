import { ClusterManager } from "discord-hybrid-sharding";
import { ConfigDataService } from "./services/ConfigDataService.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
config();

const __dirname = dirname(fileURLToPath(import.meta.url));

process.env.IS_SHARING = "true";

const manager = new ClusterManager(join(__dirname, "index.js"), {
  totalShards: 7, // or 'auto'
  /// Check below for more options
  shardsPerClusters: 2,
  // totalClusters: 7,
  mode: "process", // you can also choose "worker"
  token: new ConfigDataService().data.bot.TOKEN,
});

manager.on("clusterCreate", (cluster) =>
  console.log(`Launched Cluster ${cluster.id}`)
);
manager.spawn({ timeout: -1 });
