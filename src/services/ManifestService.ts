import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ManifestInterface } from '../@types/Manifest.js'
const __dirname = dirname(fileURLToPath(import.meta.url))

export class ManifestService {
  get data(): ManifestInterface {
    const data = fs.readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8')
    const jsonData = JSON.parse(data)
    const countPackage = Object.keys(jsonData.dependencies).length
    const countDevPackage = Object.keys(jsonData.devDependencies).length
    const result: ManifestInterface = {
      metadata: {
        bot: {
          version: jsonData.version,
          codename: jsonData.byteblaze.codename,
        },
        autofix: {
          version: jsonData.byteblaze.autofix.version,
          codename: jsonData.byteblaze.autofix.codename,
        },
      },
      package: {
        discordjs: jsonData.dependencies['discord.js'].substring(1),
        rainlink: jsonData.dependencies['rainlink'].substring(1),
        typescript: jsonData.devDependencies['typescript'].substring(1),
        globalAmount: countPackage,
        devAmount: countDevPackage,
        totalAmount: countDevPackage + countPackage,
      },
    }
    return result
  }
}
