export default {
    name: 'train',
    description: 'Entrena tus habilidades',
    comand: ['train'],
    exec: async (m, { sock, db }) => {
        const stats = ["fuerza", "inteligencia", "resistencia", "velocidad"];
        const user = db.data.users[m.sender]?.games.find(g => g.role);

        if (!user) 
            return await sock.sendMessage(m.from, { text: "⚠️ Primero elige un rol con `.role`." }, { quoted: m });

        const cooldown = 60 * 1000; // 1 minuto
        if (user.lastTrain && Date.now() - user.lastTrain < cooldown) 
            return await sock.sendMessage(m.from, { text: "⏳ Debes esperar antes de entrenar de nuevo." }, { quoted: m })

        const args = m.args[0]
        if (stats.includes(args)) {
            const increase = Math.floor(Math.random() * 3) + 1
            user.stats[args] += increase
            user.lastTrain = Date.now()

            return await sock.sendMessage(m.from, { 
                text: `💪 Has entrenado *${args}* y ha aumentado en *${increase}* puntos.\n\n📊 Stats actuales:\n${stats.map(s => `- ${s}: *${user.stats[s]}*`).join("\n")}` 
            }, { quoted: m })
        }

        await sock.sendMessage(m.from, {
            text: "🏋️ *Entrena un atributo:*",
            footer: _config.bot.credits,
            interactiveButtons: [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: "Selecciona un atributo para entrenar",
                    sections: [{ title: "Atributos disponibles", rows: stats.map(s => ({ title: s, id: `.train ${s}` })) }]
                })
            }]
        })
    }
}