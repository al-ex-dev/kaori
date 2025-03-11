export default {
    name: 'antiporn',
    params: ['on/off'],
    description: 'Habilitar o deshabilitar antiporn',
    comand: ['antiporn'],
    exec: async (m, { sock, db }) => {
        if (m.args[0] === 'on') {
            if (db.data.chats[m.from].antiporn) return m.reply('➤ Comando: antiporn ⧉ Estado: ya está habilitado.')
            db.data.chats[m.from].antiporn = true
            await m.reply('➤ Comando: antiporn ⧉ Estado: habilitado.')
        } else if (m.args[0] === 'off') {
            if (!db.data.chats[m.from].antiporn) return m.reply('➤ Comando: antiporn ⧉ Estado: ya está deshabilitado.')
            db.data.chats[m.from].antiporn = false
            await m.reply('➤ Comando: antiporn ⧉ Estado: deshabilitado.')
        } else {
            const status = db.data.chats[m.from].antiporn ? 'habilitado' : 'deshabilitado';
            await m.reply(`➤ Comando: antiporn ⧉ Estado: ${status}\nPara modificar usa antiporn <on/off>`)
        }
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}
