export default {
    name: 'antidelete',
    params: ['on/off'],
    description: 'Habilitar o deshabilitar antidelete',
    comand: ['antidelete'],
    exec: async (m, { sock, db }) => {
        if (m.args[0] === 'on') {
            if (db.data.chats[m.from].antidelete) return m.reply('➤ Comando: antidelete ⧉ Estado: ya está habilitado.')
            db.data.chats[m.from].antidelete = true
            await m.reply('➤ Comando: antidelete ⧉ Estado: habilitado.' )
        } else if (m.args[0] === 'off') {
            if (!db.data.chats[m.from].antidelete) return m.reply('➤ Comando: antidelete ⧉ Estado: ya está deshabilitado.')
            db.data.chats[m.from].antidelete = false
            await m.reply('➤ Comando: antidelete ⧉ Estado: deshabilitado.')
        } else {
            const status = db.data.chats[m.from].antidelete ? 'habilitado' : 'deshabilitado'
            await m.reply(`➤ Comando: antidelete ⧉ Estado: ${status}`)
        }
    },
    isAdmin: true,
    isGroup: true
}
