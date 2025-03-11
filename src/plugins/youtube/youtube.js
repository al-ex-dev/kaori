import YouTube from "../../scraper/youtube.js"

export default {
    name: 'youtube',
    params: ['message'],
    description: 'Busca y descarga videos y audios de YouTube',
    comand: ['youtube', 'yt', 'play'],
    os: true,
    exec: async (m, { sock }) => {
        const videos = await YouTube.search(m.text).then((data => data))
        const video = videos[0]

        sock.sendMessage(m.from, {
            caption: `◦ᣞ᳃∘ *Ｄｏｗｎｌｏａｄ  Ｙｏｕｔｕｂｅ* ∘᳃ᣞ◦\n\n⋅◦ Title: ${video.title}\n⋅◦ Duration: ${video.duration}\n⋅◦ Author: ${video.author}\n⋅◦ Views: ${video.viewers}\n⋅◦ Published: ${video.published}\n`,
            footer: _config.bot.credits,
            image: { url: video.thumbnail },
            buttons: [
                { buttonId: 'audio', buttonText: { displayText: 'Audio' } },
                { buttonId: 'video', buttonText: { displayText: 'Video' } }
            ],
            headerType: 6,
            viewOnce: true
        })

        const filter = response => response.key.remoteJid === m.from && response.key.participant === m.sender;
        const timeout = setTimeout(() => {
            sock.ev.off('messages.upsert', responseHandler);
        }, 5 * 60 * 1000);

        const responseHandler = async response => {
            if (response.messages[0].message && response.messages[0].message.buttonsResponseMessage && filter(response.messages[0])) {
                clearTimeout(timeout)
                sock.ev.off('messages.upsert', responseHandler)

                const type = response.messages[0].message.buttonsResponseMessage.selectedButtonId === 'audio' ? 'audio' : 'video'

                if (type === 'audio') {
                    await YouTube.ytmp3(video.url).then( async (result) => {
                        await sock.sendMessage(m.from, {
                            audio: result.metadata.download,
                            mimetype: 'audio/mpeg',
                            ptt: true
                        })
                    })
                } else if (type === 'video') {
                    await YouTube.ytmp4(video.url).then( async (result) => {
                        await sock.sendMessage(m.from, {
                            video: result.metadata.download,
                            caption: result.author.name,
                        })

                    })
                }
            }
        }

        sock.ev.on('messages.upsert', responseHandler)
    }
}