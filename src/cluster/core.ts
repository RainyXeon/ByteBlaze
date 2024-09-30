import cluster, { Worker } from 'node:cluster'
import process from 'node:process'
import { config } from 'dotenv'
import { bootBot } from './bot.js'
import pidusage, { Status } from 'pidusage'
import { Collection } from '../structures/Collection.js'
import readdirRecursive from 'recursive-readdir'
import { resolve } from 'path'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { ClusterCommand, WorkerResponse } from '../@types/Cluster.js'
const __dirname = dirname(fileURLToPath(import.meta.url))
config()

export interface ClusterManagerOptions {
  shardsPerClusters: number
  totalClusters: number
}

export class ClusterManager {
  public readonly workerPID: Collection<Worker> = new Collection<Worker>()
  public readonly commands: Collection<ClusterCommand> = new Collection<ClusterCommand>()
  public readonly clusterShardList: Record<string, number[]> = {}
  public readonly totalShards: number = 0
  public customData?: {
    id: number
    shard: number[]
    shardCount: number
  }
  constructor(public readonly options: ClusterManagerOptions) {
    this.totalShards = this.options.totalClusters * this.options.shardsPerClusters
    const shardArrayID = this.arrayRange(0, this.totalShards - 1, 1)
    this.arrayChunk<number>(shardArrayID, this.options.shardsPerClusters).map((value, index) => {
      this.clusterShardList[String(index + 1)] = value
    })
    console.log(this.options.totalClusters)
  }

  public async start() {
    if (cluster.isPrimary) {
      this.log('INFO', `Primary process ${process.pid} is running`)

      await this.commandLoader()

      cluster.on('exit', (worker) => {
        this.log('WARN', `worker ${worker.process.pid} / ${worker.id} died x.x`)
      })
      cluster.on('message', async (worker, message) => {
        const jsonMsg = JSON.parse(message)
        const command = this.commands.get(jsonMsg.cmd)
        if (!command)
          return worker.send(
            JSON.stringify({ error: { code: 404, message: 'Command not found!' } })
          )
        const getRes = await command.execute(this, worker, message)
        worker.send(JSON.stringify(getRes))
      })

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

  public getWorkerInfo(clusterId: number) {
    return this.workerPID.get(String(clusterId))
  }

  public async getWorkerStatus(clusterId: number): Promise<Status | null> {
    const workerData = this.workerPID.get(String(clusterId))
    if (!workerData) return null
    return new Promise((resolve, reject) =>
      pidusage(workerData.process.pid, function (err, stats) {
        if (err) reject(null)
        resolve(stats)
      })
    )
  }

  public getShard(clusterId: number) {
    return this.clusterShardList[String(clusterId)]
  }

  public async sendMaster(
    cmd: string,
    args: Record<string, unknown> = {}
  ): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      const fullData = { cmd, args }
      cluster.worker.on('message', (message) => {
        const jsonMsg = JSON.parse(message)
        if (jsonMsg.err) return reject(null)
        resolve(message)
      })
      cluster.worker.on('error', () => {
        return reject(null)
      })
      cluster.worker.send(JSON.stringify(fullData))
    })
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

  public log(level: string, msg: string, pad: number = 9) {
    const date = new Date(Date.now()).toISOString()
    const prettyLevel = level.toUpperCase().padEnd(pad)
    const prettyClass = 'ClusterManager'.padEnd(28)
    console.log(`${date} - ${prettyLevel} - ${prettyClass} - ${msg}`)
  }

  protected async commandLoader() {
    let eventsPath = resolve(join(__dirname, 'commands'))
    let eventsFile = await readdirRecursive(eventsPath)
    for await (const path of eventsFile) {
      await this.registerCommand(path)
    }
    await new Promise((res, rej) =>
      eventsFile.forEach(async (path, index) => {
        await this.registerCommand(path)
        if (index == eventsFile.length - 1) return res(true)
      })
    )
    this.log('INFO', `Cluster command loaded successfully`)
  }

  protected async registerCommand(path: string) {
    const command = new (await import(pathToFileURL(path).toString())).default() as ClusterCommand

    if (!command.execute)
      return this.log(
        'WARN',
        `Clister command [${command.name}] doesn't have exeture function on the class, Skipping...`
      )

    this.commands.set(command.name, command)
  }
}
