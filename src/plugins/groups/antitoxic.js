export default {
    name: 'antitoxic',
    params: ['on/off'],
    description: 'Habilitar o deshabilitar antitoxic',
    comand: ['antitoxic'],
    exec: async (m, { sock, db }) => {
        if (m.args[0] === 'on') {
            if (db.data.chats[m.from].antitoxic) return m.reply('➤ Comando: antitoxic ⧉ Estado: ya está habilitado.')
            db.data.chats[m.from].antitoxic = true
            await m.reply('➤ Comando: antitoxic ⧉ Estado: habilitado.')
        } else if (m.args[0] === 'off') {
            if (!db.data.chats[m.from].antitoxic) return m.reply('➤ Comando: antitoxic ⧉ Estado: ya está deshabilitado.')
            db.data.chats[m.from].antitoxic = false
            await m.reply('➤ Comando: antitoxic ⧉ Estado: deshabilitado.')
        } else {
            const status = db.data.chats[m.from].antitoxic ? 'habilitado' : 'deshabilitado';
            await m.reply(`➤ Comando: antitoxic ⧉ Estado: ${status}\nPara modificar usa antitoxic <on/off>`)
        }
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}
