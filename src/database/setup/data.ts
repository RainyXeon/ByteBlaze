import chalk from "chalk"
import { Manager } from "../../manager.js"

export default async (client: Manager) => {
  const Client = chalk.hex("#5277bd")
  const client_mess = Client("Data: ")
  client.logger.data_loader(
    client_mess + "Setting up data table for avoid error..."
  )
  const fullList = await client.db.get("playlist")
  if (!fullList)
    await client.db.set(`playlist.pid_thedreamvastghost0923849084`, {
      id: "thedreamvastghost0923849084",
      name: "TheDreamvastGhost",
      owner: client.owner,
      tracks: [],
      private: true,
      created: Date.now(),
      description: null,
    })

  const code = client.db.get("code")

  if (!code)
    await client.db.set(`code.pmc_thedreamvastghost`, {
      code: "pmc_thedreamvastghost",
      plan: null,
      expiresAt: null,
    })

  client.logger.data_loader(
    client_mess + "Setting up data table for avoid error complete!"
  )
}
