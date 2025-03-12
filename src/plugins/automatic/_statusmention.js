export default {
    start: async (m, { sock, db } ) => {
        if (m.isGroup) {
            const stats = m.message?.groupStatusMentionMessage || (m.message?.futureProofMessage?.message?.protocolMessage?.type === 25)
            if (!stats && m.isBotAdmin) return;
            
            await sock.sendMessage(m.from, {
                text: `Mensaje interactivo detectado, @${m.sender.split("@")[0]} serás eliminado automáticamente. `,
                contextInfo: { mentionedJid: [m.sender] },
            }, { quoted: m })
            
            await sock.sendMessage(m.from, {
                delete: {
                    remoteJid: m.from,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant,
                }
            })
            
            await sock.groupParticipantsUpdate(m.from, [m.sender], "remove")
        }
    }
}