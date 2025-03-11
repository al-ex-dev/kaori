import Remini from '../../scraper/remini.js'

export default {
    name: 'quality',
    description: 'Mejora la calidad de una imagen',
    comand: ['hd', 'quality'],
    isMedia: ['image'],
    exec: async (m, { sock, v }) => {
        let download = await v.download()
        let img = await Remini.remini(download, 'enhance')
        sock.sendMessage(m.from, { image: img, caption: `Calidad mejorada` })
    }
}
