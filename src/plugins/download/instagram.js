import Instagram from "../../scraper/instagram.js"

export default {
    name: 'instagram',
    params: ['url'],
    description: 'Busca y descarga audio de Instagram',
    comand: ['instagram', 'ig'],
    exec: async (m, { sock }) => {
        const result = await Instagram.download(m.text)
        const dec = input => Array.isArray(input) ? 'array' : (input && typeof input === 'object' ? 'object' : 'unknown')
        const media = input => input === 'jpg' ? 'image' : input === 'mp4' ? 'video' : false

        if (dec(result) === 'object' && media(result.url[0].type)) {
            await sock.sendMessage(m.from, {
                [media(result.url[0].type)]: { url: result.url[0].url },
                caption: `*· Me gusta* – ${result.meta.like_count}
*· Comentarios* – ${result.meta.comment_count}
*· Creador* – ${result.meta.username}`
            })
        } else if (dec(result) === 'array' && media(result[0].url[0].type)) {
            await sock.sendAlbumMessage(m.from, result.map(({ url }) => ({
                type: media(url[0].type),
                data: {
                    url: url[0].url
                }
            })), {
                delay: 3000,
                caption: `*· Me gusta* – ${result[0].meta.like_count}
*· Comentarios* – ${result[0].meta.comment_count}
*· Creador* – ${result[0].meta.username}`
            })
        }
    }
}
