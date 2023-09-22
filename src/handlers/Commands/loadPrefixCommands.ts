import chillout from 'chillout'
import readdirRecursive from 'recursive-readdir'
import { resolve, relative } from 'path'
import { Manager } from '../../manager.js'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

export default async (client: Manager) => {
  let commandPath = resolve(join(__dirname, '..', '..', 'commands', 'prefix'))
  let commandFiles = await readdirRecursive(commandPath)

  await chillout.forEach(commandFiles, async (commandFile) => {
    const rltPath = relative(__dirname, commandFile)
    const command = (await import(pathToFileURL(commandFile).toString()))
      .default

    if (!command.name?.length) {
      client.logger.warn(
        `"${rltPath}" The prefix command file does not have a name. Skipping..`
      )
      return
    }

    if (client.commands.has(command.name)) {
      client.logger.warn(
        `"${command.name}" prefix command has already been installed. It's skipping.`
      )
      return
    }

    client.commands.set(command.name, command)

    if (command.aliases && command.aliases.length !== 0)
      command.aliases.forEach((a: string) =>
        client.aliases.set(a, command.name)
      )

    //   console.log(`[INFO] "${command.type == "CHAT_INPUT" ? `/${command.name.join(" ")}` : `${command.name[0]}`}" ${command.name[1] || ""}  ${command.name[2] || ""} The interaction has been uploaded. (it took ${Date.now() - start}ms)`);
  })
  if (client.commands.size) {
    client.logger.loader(`${client.commands.size} Prefix Command Loaded!`)
  } else {
    client.logger.warn(`No prefix command loaded, is everything ok?`)
  }
}
