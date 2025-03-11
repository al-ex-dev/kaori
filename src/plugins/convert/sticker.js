export default {
    name: 'sticker',
    description: 'Convierte imagenes/videos en stickers',
    comand: ['sticker', 's'],
    os: true,
    isMedia: ['image', 'video'],
    exec: async (m, { sock, v }) => {
        await sock.sendSticker(m.from, {
            [v.type.replace('Message', '')]: await v.download(),
            packname: m.pushName || 'annonimous',
            author: sock.user.name
        }, { quoted: m })
    }
}