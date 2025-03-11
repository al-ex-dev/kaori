export default {
    name: 'brat',
    description: 'Convierte texto en brat',
    params: ['query'],
    comand: ['brat'],
    os: true,
    exec: async (m, { sock, Scrap }) => {
        await sock.sendSticker(m.from, {
            image: await Scrap._convert.brat(m.text),
            packname: m.pushName || 'annonimous',
            author: sock.user.name
        }, { quoted: m })
    }
}