export default {
    name: 'profile',
    description: 'Muestra el perfil y atributos del jugador en el RPG.',
    comand: ['profile'],
    exec: async (m, { sock, db }) => {
        const user = db.data.users[m.sender]?.games.find(g => g.role)
        if (!user)
            return await sock.sendMessage(m.from, { text: "⚠️ No tienes un rol asignado. Usa `.role` para elegir uno." }, { quoted: m });

        const attributes = user.stats || { fuerza: 5, inteligencia: 5, resistencia: 5, agilidad: 5, suerte: 5 };
        const resources = Object.entries(user.resources || {})
            .map(([key, value]) => `🔹 *${key}*: ${value}`)
            .join("\n") || "📦 Sin recursos";

        const profileText = `🎭 *Perfil de @${m.sender.split('@')[0]}*\n\n` +
            `🔰 *Rol*: ${user.role}\n` +
            `💰 *Monedas*: ${user.money || 0}\n\n` +
            `🛠 *Atributos*:\n` +
            `⚔️ *Fuerza*: ${attributes.fuerza}\n` +
            `🧠 *Inteligencia*: ${attributes.inteligencia}\n` +
            `🛡 *Resistencia*: ${attributes.resistencia}\n` +
            `🏃 *Resistencia*: ${attributes.resistencia}\n` +
            `🍀 *Velocidad*: ${attributes.velocidad}\n\n` +
            `📦 *Inventario*:\n${resources}`;

        await sock.sendMessage(m.from, {
            text: profileText,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
    }
};