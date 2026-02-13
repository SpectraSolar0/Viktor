const { Client, GatewayIntentBits, Partials } = require("discord.js");
const config = require("./config.json");
const tickets = require("./tickets"); // ton module tickets
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// =====================
// 🌐 EXPRESS
// =====================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🤖 Azuria IA est en ligne !");
});

app.listen(PORT, () => {
  console.log(`🌍 Serveur Express lancé sur le port ${PORT}`);
});

// =====================
// 🔄 STATUT DU BOT
// =====================
const statuses = [
  { name: "🚬 Fume tranquille, je veille", type: 0 }, // 0 = Playing
  { name: "🎲 Le destin se joue ici", type: 3 }, // 3 = Watching
  { name: "🔫 Les affaires se règlent ici", type: 2 } // 2 = Listening
];

client.once("ready", () => {
  console.log(`✅ Bratstvo Medved Bot connecté : ${client.user.tag}`);

  // Rotation du statut toutes les 15 secondes
  let i = 0;
  setInterval(() => {
    const status = statuses[i];
    client.user.setActivity(status.name, { type: status.type });
    i = (i + 1) % statuses.length;
  }, 15000);
});

// =====================
// 💬 MESSAGE DE BIENVENUE + AUTO ROLE
// =====================
client.on("guildMemberAdd", async member => {
  try {
    // 🔹 Récupération du salon de bienvenue via l'ID dans config.json
    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);

    if (welcomeChannel) {
      welcomeChannel.send(`
🐻 ${member}, bienvenue dans **Bratstvo Medved**.
Ici, chaque ours a sa place, mais garde les yeux ouverts… 👀
`);
    } else {
      console.error("Salon de bienvenue introuvable !");
    }

    // 🔹 Attribution automatique d’un rôle
    const autoRole = member.guild.roles.cache.get(config.autoRoleId);
    if (autoRole) {
      await member.roles.add(autoRole);
    }

  } catch (err) {
    console.error("Erreur bienvenue / auto role :", err);
  }
});


// =====================
// 🎟️ TICKETS
// =====================
client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "tickets") {
      await tickets.sendTicketPanel(interaction);
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("ticket_")) {
      const type = interaction.customId.replace("ticket_", "");
      await tickets.createTicket(interaction, type);
    } else if (interaction.customId === "close_ticket") {
      await tickets.closeTicket(interaction);
    }
  }
});

client.login(process.env.TOKEN);
