export default {
    name: 'demote',
    description: 'Degradar miembro de administrador',
    comand: ['demote'],
    isQuoted: true,
    exec: async (m, { sock }) => {
        const user = m.quoted ? m.quoted.sender : (m.mentionedJid.length ? m.mentionedJid[0] : m.args.join(" ").replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        if (!user) return await sock.sendMessage(m.from, { text: 'Selecciona un usuario para degradar.' }, { quoted: m });

        const admins = await sock.getAdmins(m.from);
        if (!admins.includes(user)) return await sock.sendMessage(m.from, { text: 'El usuario no es administrador.' }, { quoted: m });

        await sock.groupParticipantsUpdate(m.from, [user], "demote");
        await sock.sendMessage(m.from, {
            text: `Usuario ${user.split("@")[0]} degradado con éxito.`,
            mentions: [...admins, user]
        }, { quoted: m });
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}
