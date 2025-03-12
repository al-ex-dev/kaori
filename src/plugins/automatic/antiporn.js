const nsfwjs = require('nsfwjs')
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';

await tf.setBackend('wasm')
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import os from 'os'
import path from 'path'

const modelPromise = nsfwjs.load()

export default {
    start: async (m, { sock, db }) => {
        if (!db.data.chats[m.from]?.antiporn) return
        const model = await modelPromise
        let buffer

        if (m.type === 'imageMessage' || m.type === 'stickerMessage') {
            buffer = await m.download();
        } else if (m.type === 'videoMessage') {
            buffer = await m.download()
            const videoPath = path.join(os.tmpdir(), `vid-${Date.now()}.mp4`)
            fs.writeFileSync(videoPath, buffer);
            const framePath = path.join(os.tmpdir(), `frame-${Date.now()}.jpg`)
            await new Promise((res, rej) => {
                ffmpeg(videoPath)
                    .screenshots({
                        timestamps: ['50%'],
                        filename: path.basename(framePath),
                        folder: os.tmpdir(),
                        size: '320x240'
                    })
                    .on('end', res)
                    .on('error', rej);
            });
            buffer = fs.readFileSync(framePath)
            fs.unlinkSync(videoPath)
            fs.unlinkSync(framePath)
        } else return

        if (!buffer) return
        const image = tf.node.decodeImage(buffer, 3)
        const predictions = await model.classify(image)
        image.dispose()

        if (predictions.some(p => ['Porn', 'Hentai', 'Sexy'].includes(p.className) && p.probability > 0.6)) {
            await sock.sendMessage(m.from, { text: 'Contenido NSFW detectado y eliminado.' });
            await sock.sendMessage(m.from, { delete: { remoteJid: m.from, fromMe: false, id: m.id, participant: m.sender }})
        }
    }
};
