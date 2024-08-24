import { ClusterCommand, WorkerMessage, WorkerResponse } from "../../@types/Cluster.js";
import { ClusterManager } from "../core.js";
import { Worker } from 'node:cluster'

export default class extends ClusterCommand {
  public get name(): string {
    return 'all_worker_pid'
  }

  public async execute(manager: ClusterManager, worker: Worker, message: WorkerMessage): Promise<WorkerResponse> {
    return {
      response: manager.workerPID.full.map((value) => value[1].process.pid)
    }
  }
}