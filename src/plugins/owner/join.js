export default {
    name: 'join',
    params: ['url'],
    description: 'Unirse a un grupo mediante un enlace de invitación',
    comand: ['join', 'unirse'],
    isOwner: true,
    exec: async (m, { sock }) => {
        const code = m.args.join(" ").split("chat.whatsapp.com/")[1];
        const data = await sock.groupGetInviteInfo(code);

        if (Object.keys(store.groupMetadata).includes(data.id)) {
            await sock.sendMessage(m.from, { text: 'Ya estoy en el grupo.' }, { quoted: m });
            if (m.from != data.id) {
                return await sock.sendMessage(data.id, { text: `Hola, soy el bot y me he unido al grupo.` }, { quoted: m });
            } else return;
        }

        const joined = await sock.groupAcceptInvite(code);
        if (joined) {
            await sock.sendMessage(m.from, { text: `Me he unido al grupo ${data.subject} con éxito.` }, { quoted: m });
            await sock.sendMessage(data.id, { text: `Hola, soy el bot y me he unido al grupo.` }, { quoted: m });
        } else {
            await sock.sendMessage(m.from, { text: 'Error al unirse al grupo.' }, { quoted: m });
        }
    }
};
