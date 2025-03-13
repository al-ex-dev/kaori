export default {
    name: 'ver',
    params: [],
    description: 'Reenvía el contenido multimedia citado',
    comand: ['ver'],
    isQuoted: true,
    exec: async (m, { sock }) => {
        if (/video/.test(m.quoted.type)) {
            return await sock.sendMessage(m.from, { video: await m.quoted.download() }, { quoted: m });
        }
        if (/image/.test(m.quoted.type)) {
            return await sock.sendMessage(m.from, { image: await m.quoted.download() }, { quoted: m });
        }
        if (/audio/.test(m.quoted.type)) {
            return await sock.sendMessage(m.from, { audio: await m.quoted.download() }, { quoted: m });
        }
    }
}
