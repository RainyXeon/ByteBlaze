export interface ManifestInterface {
  metadata: {
    bot: {
      version: string
      codename: string
    }
    autofix: {
      version: string
      codename: string
    }
  }
  package: {
    discordjs: string
    rainlink: string
    devAmount: number
    globalAmount: number
    totalAmount: number
    typescript: string
  }
}
