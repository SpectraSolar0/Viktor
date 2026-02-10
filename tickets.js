const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  EmbedBuilder,
  ChannelType
} = require("discord.js");
const config = require("./config.json");

/**
 * Texte de bienvenue selon le type de ticket
 */
function getTicketWelcome(type) {
  switch (type) {
    case "recrutement":
      return "**🧑‍🤝‍🧑 Recrutement Bratstvo Medved**\n\n" +
        "Bienvenue, futur membre. Ici tu vas montrer ta loyauté et ton sérieux.\n" +
        "Explique-nous pourquoi tu veux rejoindre la famille et ton expérience RP.\n\n" +
        "*Bratstvo Medved surveille tout, mais juge avec respect.*";

    case "business":
      return "**💰 Business et Deals**\n\n" +
        "Salutations. Ici nous gérons les affaires de la famille.\n" +
        "Expose clairement ton deal, tes demandes ou tes partenariats.\n\n" +
        "*La discrétion est obligatoire, le respect aussi.*";

    case "interne":
      return "**🔫 Affaires internes**\n\n" +
        "Tu es ici pour régler un problème interne.\n" +
        "Explique calmement la situation, un membre du staff prendra le relais.\n\n" +
        "*Bratstvo Medved veille sur tout.*";

    case "question":
      return "**❓ Question / Information**\n\n" +
        "Besoin d’infos ou d’aide RP ?\n" +
        "Pose ta question clairement et un membre du staff te répondra.\n\n" +
        "*Respect et patience.*";

    default:
      return "Bienvenue dans le ticket. Explique ton problème clairement.";
  }
}

/**
 * Crée le panneau de tickets dans un salon
 */
async function sendTicketPanel(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x8b0000)
    .setTitle("🎟️ Bureau de Bratstvo Medved")
    .setDescription(
      "**Ici, rien ne se règle en public.**\n" +
      "Choisis le type de ticket que tu souhaites ouvrir.\n" +
      "*Loyauté, discrétion, respect.*"
    )
    .setFooter({ text: "Bratstvo Medved • Discord RP" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_recrutement")
      .setLabel("Recrutement")
      .setEmoji("🧑‍🤝‍🧑")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("ticket_business")
      .setLabel("Business")
      .setEmoji("💰")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("ticket_interne")
      .setLabel("Problème interne")
      .setEmoji("🔫")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("ticket_question")
      .setLabel("Question")
      .setEmoji("❓")
      .setStyle(ButtonStyle.Secondary)
  );

  // ✅ on defer puis edit pour éviter le message "Vous avez utilisé /tickets"
  await interaction.deferReply({ ephemeral: false });
  await interaction.editReply({ embeds: [embed], components: [row] });
}


/**
 * Crée un ticket
 */
async function createTicket(interaction, type) {
  const guild = interaction.guild;

  // Vérifie si l'utilisateur a déjà un ticket ouvert
  const existing = guild.channels.cache.find(
    c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
  );

  if (existing) {
    return interaction.reply({
      content: "❌ Tu as déjà un ticket ouvert.",
      ephemeral: true
    });
  }

  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategory,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ]
      },
      {
        id: config.staffRoleId,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ]
      }
    ]
  });

  const embed = new EmbedBuilder()
    .setColor(0x8b0000)
    .setTitle("🎟️ Ticket ouvert")
    .setDescription(getTicketWelcome(type))
    .setFooter({ text: "Bratstvo Medved • Ticket RP" });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Fermer le ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: `<@${interaction.user.id}>`,
    embeds: [embed],
    components: [closeRow]
  });

  await interaction.reply({
    content: "✅ Ton ticket a été créé.",
    ephemeral: true
  });
}

/**
 * Ferme un ticket
 */
async function closeTicket(interaction) {
  await interaction.reply("🔒 Ticket fermé. Suppression dans 5 secondes...");

  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 5000);
}

// Export des fonctions
module.exports = {
  sendTicketPanel,
  createTicket,
  closeTicket
};
