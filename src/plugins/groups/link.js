export default {
    name: 'link',
    description: 'Envía el enlace de invitación del grupo',
    comand: ['link', 'invitelink'],
    exec: async (m, { sock }) => {
        await sock.sendMessage(m.from, {
            text: `Enlace de invitación del grupo: ${m.metadata.subject}\nEnlace: ${m.metadata.subject}`,
            contextInfo: { mentionedJid: m.metadata.participants.map((p) => p.id), remoteJid: m.from }
        });
    },
    isAdmin: true,
    isGroup: true
}
