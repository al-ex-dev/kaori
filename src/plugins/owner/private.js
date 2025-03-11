export default {
    name: 'private',
    params: ['on/off'],
    description: 'Comando privado',
    comand: ['private'],
    exec: async (m, { sock, db }) => {
        if (m.args[0] === 'on') {
            if (db.data.settings[sock.user.jid].private) return m.reply('➤ Comando: private ⧉ Estado: ya está habilitado.')
            db.data.settings[sock.user.jid].private = true
            await m.reply('➤ Comando: private ⧉ Estado: habilitado.' )
        } else if (m.args[0] === 'off') {
            if (!db.data.settings[sock.user.jid].private) return m.reply('➤ Comando: private ⧉ Estado: ya está deshabilitado.')
            db.data.settings[sock.user.jid].private = false
            await m.reply('➤ Comando: private ⧉ Estado: deshabilitado.')
        } else {
            const status = db.data.settings[sock.user.jid].private ? 'habilitado' : 'deshabilitado'
            await m.reply(`➤ Comando: private ⧉ Estado: ${status}`)
        }
    },
    isOwner: true
}