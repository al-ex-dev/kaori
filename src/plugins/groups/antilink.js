export default {
    name: 'antilink',
    description: 'Habilitar o deshabilitar antilink',
    comand: ['antilink'],
    exec: async (m, { sock, db }) => {
        const chat = db.data.chats[m.from]

        const { args: [arg0, arg1] } = m

        if (['on', 'off'].includes(arg0)) {
            chat.antilink.status = arg0 === 'on'
            return await sock.sendMessage(m.from, { text: `Antilink ${chat.antilink.status ? 'habilitado' : 'deshabilitado'}.`, footer: _config.bot.credits }, { quoted: m })
        }

        if (!chat.antilink.status) return await sock.sendMessage(m.from, { text: "El antilink está deshabilitado.", footer: _config.bot.credits }, { quoted: m })

        const platform = Object.keys(chat.antilink.platforms).find(p => p === arg0)
        if (platform) {
            chat.antilink.platforms[platform].status = arg1 ? arg1 === 'on' : !chat.antilink.platforms[platform].status
            return await sock.sendMessage(m.from, { text: `Notificaciones ${platform} ${chat.antilink.platforms[platform].status ? 'activadas' : 'desactivadas'}`, footer: _config.bot.credits}, { quoted: m })
        }
        await sock.sendMessage(m.from, {
            text: "Seleccione una opción para darle excepcion a una plataforma en el antilink:",
            footer: _config.bot.credits,
            interactiveButtons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: 'options',
                    sections: [
                        {
                            title: 'Opciones',
                            rows: Object.keys(chat.antilink.platforms).map(type => ({
                                header: 'Estado',
                                title: type,
                                description: `${chat.antilink.platforms[type].status ? 'activado' : 'desactivado'}`,
                                id: `.antilink ${type}`
                            }))
                        }
                    ]
                })
            }]
        })

    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}