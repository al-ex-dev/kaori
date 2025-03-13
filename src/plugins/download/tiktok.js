import Tiktok from "../../scraper/tiktok.js"

export default {
    name: 'tiktok',
    params: ['url'],
    description: 'Descarga o busca videos de TikTok',
    comand: ['tiktok', 'tt'],
    exec: async (m, { sock }) => {
        Tiktok.download(m.text).then(async ({ data }) => {
            if (data.media.type === 'video') {
                await sock.sendMessage(m.from, {
                    caption: data.title,
                    video: { url: data.media.nowatermark.play }
                }, { quoted: m })
            } else if (data.media.type === 'image') {
                if (data.media.images.length > 1) {
                    await sock.sendAlbumMessage(m.from, data.media.images.map((url) => ({
                        type: data.media.type,
                        data: {
                            url: url
                        }
                    })), {
                        delay: 3000,
                        caption: data.title
                    })
                } else {
                    await sock.sendMessage(m.from, {
                        caption: data.title,
                        image: { url: data.media.images[0] }
                    }, { quoted: m })
                }
            }
        }).catch(error => console.error('Error capturado:', error))
    }
}