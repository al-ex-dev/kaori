export default {
    name: 'hidetag',
    description: 'Reenvía un mensaje citado a todos los participantes del grupo',
    comand: ['hidetag', 'tagall', 'todos'],
    isQuoted: true,
    exec: async (m, { sock }) => {
        await sock.sendMessage(m.from, {
            forward: m.quoted,
            contextInfo: { mentionedJid: m.metadata.participants.map((p) => p.id), remoteJid: m.from }
        })
    },
    isOwner: true,
    isGroup: true
}
