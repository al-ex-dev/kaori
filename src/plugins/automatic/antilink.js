export default {
    start: async (m, { sock, db, Func }) => 
        db.data.chats[m.from]?.antilink?.status 
        && m.isGroup 
        && m.isBotAdmin 
        && !m.isAdmin 
        && Func.detect(m.body)?.length 
        && (links => links.filter(l => 
            (p => p && !db.data.chats[m.from].antilink.platforms[p].status)
            (Object.keys(db.data.chats[m.from].antilink.platforms).find(p => l.includes(p)))
        ))(Func.detect(m.body)).length
        && await Promise.all([
            sock.groupParticipantsUpdate(m.from, [m.sender], "remove"),
            sock.sendMessage(m.from, { delete: { ...m, participant: m.sender } }),
            m.reply(`Enlace detectado y eliminado. @${m.sender.split('@')[0]} fue eliminado.`)
        ])
}