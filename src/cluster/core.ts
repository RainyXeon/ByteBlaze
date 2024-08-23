import cluster from 'node:cluster'
import process from 'node:process'
import { config } from 'dotenv'
import { bootBot } from './bot.js'
config()

export interface ClusterManagerOptions {
  shardsPerClusters: number
  totalClusters: number
}

export class ClusterManager {
  public readonly clusterShardList: Record<string, number[]> = {}
  public readonly totalShards: number = 0
  constructor(public readonly options: ClusterManagerOptions) {
    this.totalShards = this.options.totalClusters * this.options.shardsPerClusters
    const shardArrayID = this.arrayRange(0, this.totalShards - 1, 1)
    this.arrayChunk<number>(shardArrayID, this.options.shardsPerClusters).map((value, index) => {
      this.clusterShardList[String(index + 1)] = value
    })
  }

  public async start() {
    if (cluster.isPrimary) {
      this.log('INFO', `Primary process ${process.pid} is running`)
      for (let i = 0; i < this.options.totalClusters; i++) {
        cluster.fork()
      }

      cluster.on('exit', (worker) => {
        this.log('WARN', `worker ${worker.process.pid} / ${worker.id} died`)
      })
    } else {
      bootBot(this)

      this.log('INFO', `Worker ${process.pid} / ${cluster.worker.id} started`)
    }
  }

  public getShard(clusterId: number) {
    return this.clusterShardList[String(clusterId)]
  }

  protected arrayRange(start: number, stop: number, step: number) {
    return Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step)
  }

  protected arrayChunk<D = unknown>(array: D[], chunkSize: number): D[][] {
    return [].concat.apply(
      [],
      array.map(function (_, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)]
      })
    )
  }

  protected log(level: string, msg: string, pad: number = 9) {
    const date = new Date(Date.now()).toISOString()
    const prettyLevel = level.toUpperCase().padEnd(pad)
    const prettyClass = 'ClusterManager'.padEnd(28)
    console.log(`${date} - ${prettyLevel} - ${prettyClass} - ${msg}`)
  }
}
