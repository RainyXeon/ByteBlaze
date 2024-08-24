import { Worker } from 'node:cluster'
import { ClusterManager } from '../cluster/core.js'

export interface ClusterManagerOptions {
  shardsPerClusters: number
  totalClusters: number
}

export interface WorkerMessage {
  cmd: string
  args: Record<string, unknown>
}

export interface WorkerResponse {
  response: unknown
}

export abstract class ClusterCommand {
  public get name(): string {
    throw new Error(`This command doesn't have name`)
  }

  public async execute(
    manager: ClusterManager,
    worker: Worker,
    message: WorkerMessage
  ): Promise<WorkerResponse> {
    throw new Error(`This command doesn't have execute function`)
  }
}
