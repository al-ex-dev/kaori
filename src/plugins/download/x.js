import Twitter from "../../scraper/x.js"

export default {
    name: 'twitter',
    params: ['url'],
    description: 'Descarga y envía imágenes o videos de Twitter',
    comand: ['twitter', 'tw', 'x'],
    exec: async (m, { sock }) => {
        Twitter.download(m.text).then(async ({ media }) => {
            const messages = media.map(item => {
                if (item.type === 'photo') {
                    return { type: 'image', data: { url: item.media_url_https } }
                }
                if (item.type === 'video' || item.type === 'animated_gif') {
                    const variants = item.variants.filter(v => v.content_type === 'video/mp4')
                    const best = variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]
                    return { type: 'video', data: { url: best ? best.url : item.media_url_https } }
                }
                return null
            }).filter(Boolean)
            if (messages.length === 1) {
                await sock.sendMessage(m.from, { [messages[0].type]: { url: messages[0].data.url } })
            } else if (messages.length > 1) {
                await sock.sendAlbumMessage(m.from, messages, { delay: 3000 })
            }
        })
    }
}