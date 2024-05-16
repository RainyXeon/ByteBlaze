import { AutocompleteInteraction } from "discord.js";
import { Manager } from "../manager.js";

export class AutoCompleteService {
  client: Manager;
  interaction: AutocompleteInteraction;
  constructor(client: Manager, interaction: AutocompleteInteraction) {
    this.client = client;
    this.interaction = interaction;
    this.execute();
  }
  async execute() {
    let guildModel = await this.client.db.language.get(`${this.interaction.guild?.id}`);

    if (!guildModel) {
      guildModel = await this.client.db.language.set(`${this.interaction.guild?.id}`, this.client.config.bot.LANGUAGE);
    }

    const language = guildModel;

    let subCommandName = "";
    try {
      subCommandName = this.interaction.options.getSubcommand();
    } catch {}
    let subCommandGroupName;
    try {
      subCommandGroupName = this.interaction.options.getSubcommandGroup();
    } catch {}

    const commandNameArray = [];

    if (this.interaction.commandName) commandNameArray.push(this.interaction.commandName);
    if (subCommandName.length !== 0 && !subCommandGroupName) commandNameArray.push(subCommandName);
    if (subCommandGroupName) {
      commandNameArray.push(subCommandGroupName);
      commandNameArray.push(subCommandName);
    }
    const command = this.client.commands.get(commandNameArray.join("-"));

    if (!command) return commandNameArray.length == 0;

    try {
      (command as any).autocomplete ? (command as any).autocomplete(this.client, this.interaction, language) : true;
    } catch (error) {
      this.client.logger.error(AutoCompleteService.name, error);
    }
    return;
  }
}
