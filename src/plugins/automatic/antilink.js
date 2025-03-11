export default {
    start: async (m, { sock } ) => {
        if (db.data.chats[m.from]?.antilink.status && m.isGroup && m.isBotAdmin && !m.isAdmin) {
            const links = Func.detect(m.body)
            if (links.some(u => {
                try {
                    const h = new URL(u).hostname.toLowerCase()
                    return Object.values(db.data.chats[m.from].antilink.links).some(({ allowed, domains }) => !allowed && domains.some(d => h.endsWith(d)))
                } catch { return false }
            })) {
                await sock.groupParticipantsUpdate(m.from, [m.sender], "remove")
                await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender } })
                await m.reply(`Enlace detectado y eliminado. @${m.sender.split('@')[0]} fue eliminado del grupo.`)
                return
            }
        }
    }
}