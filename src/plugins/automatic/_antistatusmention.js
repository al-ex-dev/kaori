export default {
    name: 'antistatusmention',
    isGroup: true,
    start: async (m, { sock, db }) => {
        const stats = (m.message && m.message?.groupStatusMentionMessage) ?? (m.message && m.message?.protocolMessage && m.message.protocolMessage?.type === 25)

        if (stats) {
            console.log(`groupStatusMentionMessage: true`)
        }
        // if (stats && m.isBotAdmin) return

        /*await sock.sendMessage(m.from, {
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
        
        await sock.groupParticipantsUpdate(m.from, [m.sender], "remove")*/
    }

}