import { ClusterManager } from "discord-hybrid-sharding";
import * as config from "./plugins/config.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const manager = new ClusterManager(join(__dirname, "index.js"), {
  totalShards: 7, // or 'auto'
  /// Check below for more options
  shardsPerClusters: 2,
  // totalClusters: 7,
  mode: "process", // you can also choose "worker"
  token: config.default.bot.TOKEN,
});

manager.on("clusterCreate", (cluster) =>
  console.log(`Launched Cluster ${cluster.id}`)
);
manager.spawn({ timeout: -1 });
