export default {
    name: 'antilink',
    params: ['on/off'],
    description: 'Habilitar o deshabilitar antilink',
    comand: ['antilink'],
    exec: async (m, { sock, db }) => {
        if (m.args[0] === 'on') {
            if (db.data.chats[m.from].antilink.status) return m.reply('➤ Comando: antilink ⧉ Estado: ya está habilitado.')
                db.data.chats[m.from].antilink = true
            await m.reply('➤ Comando: antilink ⧉ Estado: habilitado.')
        } else if (m.args[0] === 'off') {
            if (!db.data.chats[m.from].antilink) return m.reply('➤ Comando: antilink ⧉ Estado: ya está deshabilitado.')
                db.data.chats[m.from].antilink = false
            await m.reply('➤ Comando: antilink ⧉ Estado: deshabilitado.')
        } else {
            const status = db.data.chats[m.from].antilink ? 'habilitado' : 'deshabilitado';
            await m.reply(`➤ Comando: antilink ⧉ Estado: ${status}\nPara modificar usa antilink <on/off>`)
        }
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}