export default {
    name: 'antifake',
    params: ['on/off'],
    description: 'Habilitar o deshabilitar antifake',
    comand: ['antifake', 'addfake', 'delfake', 'listfake'],
    exec: async (m, { sock, db }) => {

        if (m.command === 'antifake') {
            if (m.args[0] === 'on') {
                if (db.data.chats[m.from].antifake) return m.reply('➤ Comando: antifake ⧉ Estado: ya está habilitado.')
                db.data.chats[m.from].antifake = true
                await m.reply('➤ Comando: antifake ⧉ Estado: habilitado.')
            } else if (m.args[0] === 'off') {
                if (!db.data.chats[m.from].antifake) return m.reply('➤ Comando: antifake ⧉ Estado: ya está deshabilitado.')
                db.data.chats[m.from].antifake = false
                await m.reply('➤ Comando: antifake ⧉ Estado: deshabilitado.')
            } else {
                const status = db.data.chats[m.from].antifake ? 'habilitado' : 'deshabilitado';
                await m.reply(`➤ Comando: antifake ⧉ Estado: ${status}\nPara modificar usa antifake <on/off>`)
            }
        } else if (m.command === 'addfake') {
            if (!db.data.chats[m.from].antifake) return m.reply('➤ Comando: addfake ⧉ Error: El antifake no está habilitado en este grupo.');

            db.data.chats[m.from].fake.push(m.text);
            await m.reply(`➤ Comando: addfake ⧉ Prefijo ${m.text} agregado a la lista de números falsos.`)
        } else if (m.command === 'delfake') {
            if (!db.data.chats[m.from].antifake) return m.reply('➤ Comando: delfake ⧉ Error: El antifake no está habilitado en este grupo.');

            const index = db.data.chats[m.from].fake.indexOf(m.text);
            if (index === -1) return m.reply(`➤ Comando: delfake ⧉ Error: El prefijo ${m.text} no se encuentra en la lista de números falsos.`);

            db.data.chats[m.from].fake.splice(index, 1);
            await m.reply(`➤ Comando: delfake ⧉ Prefijo ${m.text} eliminado de la lista de números falsos.`)
        }

    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}
