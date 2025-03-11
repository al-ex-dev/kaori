export default {
    start: async (m, { sock, db }) => {
        if (db.data.chats[m.from]?.antitoxic) {
            let { data: prmpt } = await axios.get("https://raw.githubusercontent.com/al-e-dev/prompt/refs/heads/main/detect.js");

            let { data } = await axios.post("https://chateverywhere.app/api/chat/", {
                model: { id: "gpt-4", name: "GPT-4", maxLength: 32000, tokenLimit: 8000, completionTokenLimit: 5000, deploymentName: "gpt-4" },
                messages: [{ pluginId: null, content: m.text, role: "user" }],
                prompt: prmpt,
                temperature: 0.5
            }, {
                headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" }
            })

            const resultado = typeof data === 'string' ? JSON.parse(data) : data

            if (resultado.obsenity.match) {
                if (m.isAdmin) {
                    m.reply("Stupid admin, no puedes decir eso")
                    await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender } })
                    return
                }
                m.reply("Se ha detectado un mensaje obsceno y serás eliminado automáticamente.")
                await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender } })
                await sock.groupParticipantsUpdate(m.from, [m.sender], "remove")
                db.data.users[m.sender].warnings = 0
            } else if (resultado.offensive.match) {
                if (m.isAdmin) {
                    await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender } })
                    m.reply("Stupid admin, no puedes decir eso")
                    return
                }
                if (db.data.users[m.sender].warnings >= 3) {
                    m.reply("El mensaje acumula 3 advertencias y serás eliminado.")
                    await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender } })
                    await sock.groupParticipantsUpdate(m.from, [m.sender], "remove")
                    db.data.users[m.sender].warnings = 0
                } else {
                    m.reply(`Se detecto un mensaje ofensivo`)
                    await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender } })
                    db.data.users[m.sender].warnings += 1
                }
            }
        }
    }
}