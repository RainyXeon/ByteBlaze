import { ActionRowBuilder, ApplicationCommandOptionType, ComponentType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'
import { Manager } from '../../manager.js'
import { Accessableby, Command } from '../../structures/Command.js'
import { CommandHandler } from '../../structures/CommandHandler.js'
import { RadioStationNewInterface } from '../../utilities/RadioStations.js'

// Main code
export default class implements Command {
  public name = ['radio']
  public description = 'Play radio in voice channel'
  public category = 'Music'
  public accessableby = [Accessableby.Member]
  public usage = '<radio_number>'
  public aliases = ['ra']
  public lavalink = false
  public playerCheck = false
  public usingInteraction = true
  public sameVoiceCheck = false
  public permissions = []
  public options = [
    {
      name: "number",
      description: "The number of radio to choose the radio station",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ];

  public async execute(client: Manager, handler: CommandHandler) {
    await handler.deferReply()
    const radioList = RadioStationNewInterface()
    const radioListKeys = Object.keys(radioList)

    const pages: EmbedBuilder[] = []
    for (let i = 0; i < radioListKeys.length; i++) {
      const radioListKey = radioListKeys[i];
      const stringArray = radioList[radioListKey]
      const converted = this.stringConverter(stringArray)

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `List all radio avaliable in ${radioListKey}`,
          iconURL: handler.user?.displayAvatarURL(),
        })
        .setColor(client.color)
        .addFields(converted)      

      pages.push(embed)
    }

    const providerSelector = (disable: boolean) => new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('provider')
        .setPlaceholder('Choose a provider / country to get radio id list')
        .addOptions(this.getOptionBuilder(radioListKeys))
        .setDisabled(disable)
    )

    const msg = await handler.editReply({
      embeds: [pages[0]],
      components: [providerSelector(false)]
    })

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    })

    collector.on('collect', async (message): Promise<void> => {
      const providerId = Number(message.values[0])
      const providerName = radioListKeys[providerId]
      const getEmbed = pages[providerId]
      await msg.edit({ embeds: [getEmbed] })

      const replyEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`\`✅\` | Moved to **${providerName}**`)

      const msgReply = await message
        .reply({
          embeds: [replyEmbed],
          ephemeral: true
        })
        .catch(() => {})
      if (msgReply)
        setTimeout(() => msgReply.delete().catch(() => {}), client.config.utilities.DELETE_MSG_TIMEOUT)
    })

    collector.on('end', async () => {
      // @ts-ignore
      collector.removeAllListeners()
      await msg.edit({
        components: [providerSelector(false)]
      })
    })
  }

  protected getOptionBuilder(radioListKeys: string[]) {
    const result = []
    for (let i = 0; i < radioListKeys.length; i++) {
      const key = radioListKeys[i];
      result.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(key)
          .setValue(String(i))
      )
    }
    return result
  }

  protected stringConverter(array: { no: number, name: string, link: string}[]) {
    const radioStrings = []
    for (let i = 0; i < array.length; i++) {
      const radio = array[i]
      radioStrings.push(
        {
          name: `**${String(radio.no).padEnd(3)}** ${radio.name}`,
          value: " ",
          inline: true
        }
      )
    }
    return radioStrings
  }
}
