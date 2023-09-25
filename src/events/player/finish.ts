import { Queue } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";

export default async (client: Manager, queue: Queue) => {
    await client.manager.voices.leave(queue.textChannel!.guild);
    
    const embed = new EmbedBuilder()
        .setDescription(`\`📛\` | **Song has been:** \`Ended\``)
        .setColor('#000001')

    queue.textChannel!.send({ embeds: [embed] })
}