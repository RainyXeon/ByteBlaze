import { ConfigDataService } from '../services/ConfigDataService.js'
import { ClusterManager } from './core.js'

const configData = new ConfigDataService().data

configData.utilities.SHARDING_SYSTEM

const manager = new ClusterManager(configData.utilities.SHARDING_SYSTEM)

manager.start()
