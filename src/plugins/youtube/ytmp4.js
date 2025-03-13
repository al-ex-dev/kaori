import Youtube from "../../scraper/youtube.js"

export default {
    name: 'ytmp4',
    params: ['url'],
    description: 'Busca y descarga videos de YouTube',
    comand: ['playmp4', 'ytvideo', 'ytmp4'],
    exec: async (m, { sock }) => {
        let result

        if (/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(m.text)) {
            result = await Youtube.getInfo(m.text)
        } else {
            const search = await Youtube.search(m.text)
            if (!search.length) throw new Error("No results found")
            result = search[0]
        }

        await Youtube.convert(result.url, 360).then(async (download) => {
            await sock.sendMessage(m.from, {
                video: { url: download.url },
                caption: `Video de ${result.author} descargado con éxito`
            })
        })

    }
}