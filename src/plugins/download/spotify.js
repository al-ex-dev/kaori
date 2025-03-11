import Spotify from "../../scraper/spotify.js"
import Convert from "../../scraper/_convert.js"

export default {
    name: 'spotify',
    params: ['query'],
    description: 'Busca y descarga audio de spotify',
    comand: ['spotify'],
    exec: async (m, { sock }) => {
        const results = await Spotify.search(m.text)

        const track = results[0]
        const image = await Convert.spotify(track.title, track.artist.map(a => a.name).join(', '), track.thumbnail)
        await sock.sendMessage(m.from, {
            image: image,
            caption: `*Title:* ${track.title}\n*Artist:* ${track.artist.map(a => a.name).join(', ')}\n*Duration:* ${track.duration}\n*Popularity:* ${track.popularity}\n*Release Date:* ${track.date}`
        })
        Spotify.download(track.url).then(async ({ download }) => {
            await sock.sendMessage(m.from, {
                audio: { url: download },
                mimetype: 'audio/mp4',
                fileName: `${track.title}.mp3`
            })
        }).catch(async (e) => {
            Spotify.downloadV2(track.url).then(async data => {
                await sock.sendMessage(m.from, {
                    audio: { url: data },
                    mimetype: 'audio/mp4',
                    fileName: `${track.title}.mp3`
                })
            })
        })

    }
}