export default {
    name: 'remove',
    description: 'Eliminar miembro del grupo',
    comand: ['remove', 'kick', 'ban'],
    isQuoted: true,
    exec: async (m, { sock }) => {
        const users = m.mentionedJid.length ? m.mentionedJid : [m.args.join(" ").replace(/[^0-9]/g, '') + '@s.whatsapp.net']
        
        if (!users.length) return await sock.sendMessage(m.from, { text: 'Proporciona un número válido.' }, { quoted: m });
        if (users.includes(sock.user.jid)) return await sock.sendMessage(m.from, { text: 'No puedes eliminarte a ti mismo.' }, { quoted: m });
        if (users.some(user => m.admins.includes(user) && !m.isOwner)) return await sock.sendMessage(m.from, { text: 'No puedes eliminar a un administrador.' }, { quoted: m });
        if (users.includes(m.sender)) return await sock.sendMessage(m.from, { text: 'No puedes eliminarte a ti mismo.' }, { quoted: m });

        await sock.groupParticipantsUpdate(m.from, users, "remove");
        await sock.sendMessage(m.from, { text: `Usuarios eliminados con éxito.`, mentions: users }, { quoted: m });
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}