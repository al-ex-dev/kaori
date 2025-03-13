export default {
    name: 'add',
    params: ['number'],
    description: 'Añadir miembro al grupo',
    comand: ['add', 'añadir'],
    exec: async (m, { sock }) => {
        const users = m.mentionedJid?.length ? m.mentionedJid : [m.args.join``.replace(/\D/g, '') + '@s.whatsapp.net'];
        if (!users.length) return await sock.sendMessage(m.from, { text: 'Proporciona un número válido.' }, { quoted: m });

        const valid = (await Promise.all(users.map(u => 
            sock.onWhatsApp(u).then(([w]) => w?.jid).catch(() => null)
        ))).filter(Boolean);
        
        if (!valid.length) return await sock.sendMessage(m.from, { text: 'Números no registrados en WhatsApp.' }, { quoted: m });

        const { status } = await sock.groupParticipantsUpdate(m.from, valid, "add");
        const msg = {
            '403': async () => {
                const profile = await sock.profilePictureUrl(m.from, 'image').catch(() => './default.jpg');
                await sock.resizeImage(profile, 200, 200).then(({ image }) => image);
                sock.sendMessage(m.from, { text: 'Invitación enviada' }, { quoted: m });
            },
            '408': 'Usuario salió recientemente',
            '401': 'Usuario bloqueó el grupo',
            '200': 'Usuario añadido con éxito',
            '409': 'Usuario ya está en el grupo'
        }[status];

        typeof msg === 'function' ? await msg() : msg && await sock.sendMessage(m.from, { text: msg }, { quoted: m });
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}