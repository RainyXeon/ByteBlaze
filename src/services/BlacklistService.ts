import { Manager } from '../manager.js'

export class BlacklistService {
  constructor(protected client: Manager) {}

  public async checkGuild(id: string): Promise<boolean> {
    return await this.client.db.blacklist.get(`guild_${id}`)
  }

  public async checkUser(id: string): Promise<boolean> {
    return await this.client.db.blacklist.get(`user_${id}`)
  }

  public async fullCheck(
    guildId: string,
    userId: string
  ): Promise<[boolean, 'user' | 'guild' | true]> {
    const isUserBlacklist = await this.client.db.blacklist.get(`user_${userId}`)
    if (isUserBlacklist) return [true, 'user']
    const isGuildBlacklist = await this.client.db.blacklist.get(`guild_${userId}`)
    if (isGuildBlacklist) return [true, 'user']
    return [false, true]
  }
}
