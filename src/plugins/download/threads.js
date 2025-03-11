import Threads from "../../scraper/threads.js";

export default {
    name: 'threads',
    params: ['url'],
    description: 'Busca y descarga audio de threads',
    comand: ['threads', 'thread'],
    exec: async (m, { sock }) => {
        const thread = await Threads.download(m.text)

        if (Array.isArray(thread.download)) {
            await sock.sendAlbumMessage(
                m.from,
                thread.download.map(item => ({
                    type: item.type,
                    data: { url: item.url }
                })),
                {
                    caption: `Creador: ${thread.author.username}`,
                    delay: 3000
                }
            )
        } else {
            await sock.sendMessage(m.from, {
                [thread.download.type]: { url: thread.download.url },
                caption: thread.author.username
            })
        }
    }
}
