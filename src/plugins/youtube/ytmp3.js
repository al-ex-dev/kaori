import Youtube from "../../scraper/youtube.js"

export default {
    name: 'ytmp3',
    params: ['query'],
    description: 'Busca y descarga audio de YouTube',
    comand: ['playmp3', 'ytaudio', 'ytmp3'],
    exec: async (m, { sock }) => {
        let result

        if (/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(m.text)) {
            result = await Youtube.getInfo(m.text)
        } else {
            const search = await Youtube.search(m.text)
            if (!search.length) throw new Error("No results found")
            result = search[0]
        }

        await Youtube.convert(result.url, 320).then(async (download) => {
            await sock.sendMessage(m.from, {
                audio: { url: download.url },
                mimetype: 'audio/mpeg',
                ptt: true
            })
        })

    }
}