export default {
    start: async (m, { sock, db, Func } ) => {
        if (db.data.chats[m.from]?.antilink && m.isGroup && m.isBotAdmin && !m.isAdmin) {
            const links = Func.detect(m.body)
            if (Array.isArray(links) && links.length) {
                await sock.groupParticipantsUpdate(m.from, [m.sender], "remove")
                await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender } })
                await m.reply(`Enlace detectado y eliminado. @${m.sender.split('@')[0]} fue eliminado del grupo.`)
                return
            }
        }
    }
}