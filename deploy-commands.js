const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const config = require("./config.json");

const commands = [
  new SlashCommandBuilder()
    .setName("tickets")
    .setDescription("Ouvre le panneau de tickets")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("⏳ Déploiement des commandes...");

    await rest.put(
      Routes.applicationGuildCommands(
        require("discord.js").Client.prototype.user?.id ?? "1470809474280325203",
        config.guildId
      ),
      { body: commands }
    );

    console.log("✅ Commandes déployées avec succès !");
  } catch (error) {
    console.error(error);
  }
})();
