export default {
    name: 'role',
    description: 'Elige tu rol en el RPG de Dr. Stone',
    comand: ['role'],
    exec: async (m, { sock, db }) => {
        const roles = {
            "Científico": { fuerza: 2, inteligencia: 10, resistencia: 4, velocidad: 3 },
            "Explorador": { fuerza: 5, inteligencia: 5, resistencia: 7, velocidad: 8 },
            "Constructor": { fuerza: 8, inteligencia: 4, resistencia: 10, velocidad: 3 },
            "Agricultor": { fuerza: 6, inteligencia: 3, resistencia: 9, velocidad: 5 },
            "Médico": { fuerza: 3, inteligencia: 9, resistencia: 5, velocidad: 6 }
        }

        const user = db.data.users[m.sender] ||= { games: [] }
        if (user?.games?.some(g => g.role)) 
            return await sock.sendMessage(m.from, { text: "🔒 Ya tienes un rol asignado." }, { quoted: m })

        const args = m.text.split(" ").slice(1).join(" ");
        if (roles[args]) {
            user.games.push({ role: args, stats: roles[args] });
            return await sock.sendMessage(m.from, { text: `✅ Rol asignado: *${args}*\n\n🛡️ Fuerza: *${roles[args].fuerza}*\n🧠 Inteligencia: *${roles[args].inteligencia}*\n💪 Resistencia: *${roles[args].resistencia}*\n⚡ Velocidad: *${roles[args].velocidad}*` }, { quoted: m });
        }

        await sock.sendMessage(m.from, {
            text: "🌍 *Elige tu rol:*",
            footer: _config.bot.credits,
            interactiveButtons: [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Selecciona tu rol",
                    sections: [{ title: "Roles disponibles", rows: Object.keys(roles).map(r => ({ title: r, id: `.role ${r}` })) }]
                })
            }]
        })
    }
}