export default {
    name: 'broadcast',
    description: 'Envía un mensaje a todos los grupos donde el bot es administrador',
    comand: ['broadcast'],
    isQuoted: true,
    exec: async (m, { sock, delay }) => {
        const groups = Object.entries(await sock.groupFetchAllParticipating())
            .map(x => x[1])
            .filter(x => !x.announce)
            .filter(x => !x.isCommunity)
            .map(x => x.id);

        let count = 0;
        await m.reply("Iniciando envio de mensaje a " + groups.length + " grupos.")
        for (let id of groups) {
            if (m.args.join(' ')) {
                await sock.sendMessage(id, {
                    text: m.args.join(' '),
                    contextInfo: { mentionedJid: m.metadata.participants.map((p) => p.id), remoteJid: id }
                });
            }
            if (m.quoted) {
                await sock.sendMessage(id, {
                    forward: m.quoted,
                    contextInfo: { mentionedJid: m.metadata.participants.map((p) => p.id), remoteJid: id }
                });
            }
            count++;
            await delay(10000)
        }
        sock.sendMessage(m.from, { text: `Enviado a ${count} grupos` });
    },
    isOwner: true,
    isGroup: true
}
