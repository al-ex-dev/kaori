const nsfwjs = require('nsfwjs')
const tf = require('@tensorflow/tfjs-node')
import fs from 'fs'
import path from 'path'
import os from 'os'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'

ffmpeg.setFfmpegPath(ffmpegStatic)

export default {
    start: async (m, { sock, db }) => {
        if (!db.data.chats[m.from]?.antiporn) return
        if (!['imageMessage', 'videoMessage', 'stickerMessage'].includes(m.type)) return
        try {
            let buffer = await m.download()
            if (m.type === 'videoMessage') {
                const tmpVideo = path.join(os.tmpdir(), `${m.id}.mp4`)
                const tmpImage = path.join(os.tmpdir(), `${m.id}.jpg`)
                fs.writeFileSync(tmpVideo, buffer)
                await new Promise((resolve, reject) => {
                    ffmpeg(tmpVideo)
                        .screenshots({
                            timestamps: ['00:00:01.000'],
                            filename: path.basename(tmpImage),
                            folder: path.dirname(tmpImage),
                            size: '640x?'
                        })
                        .on('end', resolve)
                        .on('error', reject)
                })
                buffer = fs.readFileSync(tmpImage)
                fs.unlinkSync(tmpVideo)
                fs.unlinkSync(tmpImage)
            }
            
            const model = await nsfwjs.load()
            const imgTensor = tf.node.decodeImage(buffer, 3)
            const predictions = await model.classify(imgTensor)
            imgTensor.dispose()
            
            if (predictions.some(p => ['Porn', 'Hentai'].includes(p.className) && p.probability > 0.5)) {
                await sock.sendMessage(m.from, { text: 'Contenido NSFW detectado y eliminado.' })
                await sock.sendMessage(m.from, {
                    delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender }
                })
            }
        } catch (error) {
            console.error('Error en detector NSFW:', error)
        }
    }
}