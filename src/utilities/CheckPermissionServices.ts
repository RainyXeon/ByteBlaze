import { Message, PermissionsBitField } from "discord.js";
import { GlobalInteraction } from "../@types/Interaction.js";

export class CheckPermissionServices {
  interaction(
    interaction: GlobalInteraction,
    permArray: bigint[]
  ): "PermissionPass" | string {
    for (const permBit of permArray) {
      if (!interaction.guild!.members.me!.permissions.has(permBit)) {
        return String(this.getPermissionName(permBit));
      }
    }
    return "PermissionPass";
  }

  message(
    message: Message,
    permArray: bigint[]
  ): "PermissionPass" | string {
    for (const permBit of permArray) {
      if (!message.guild!.members.me!.permissions.has(permBit)) {
        return String(this.getPermissionName(permBit));
      }
    }
    return "PermissionPass";
  }

  private getPermissionName(permission: bigint): string {
    for (const perm of Object.keys(PermissionsBitField.Flags)) {
      if ((PermissionsBitField.Flags as any)[perm] === permission) {
        return perm;
      }
    }
    return "UnknownPermission";
  }
}
