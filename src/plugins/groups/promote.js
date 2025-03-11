export default {
    name: 'promote',
    description: 'Promover miembro a administrador',
    comand: ['promote'],
    isQuoted: true,
    exec: async (m, { sock }) => {
        const users = m.quoted ? [m.quoted.sender] : (m.mentionedJid.length ? m.mentionedJid : [m.args.join(" ").replace(/[^0-9]/g, '') + '@s.whatsapp.net']);
        if (!users.length) return await sock.sendMessage(m.from, { text: 'Selecciona un usuario para promover.' }, { quoted: m });

        const admins = await sock.getAdmins(m.from);
        const validUsers = users.filter(user => !admins.includes(user));

        if (!validUsers.length) return await sock.sendMessage(m.from, { text: 'Todos los usuarios seleccionados ya son administradores.' }, { quoted: m });

        await sock.groupParticipantsUpdate(m.from, validUsers, "promote");
        await sock.sendMessage(m.from, {
            text: `Usuarios promovidos con éxito.`,
            mentions: [...admins, ...validUsers]
        }, { quoted: m });
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
};
