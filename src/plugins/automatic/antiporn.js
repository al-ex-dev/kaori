import jpeg from "jpeg-js"

const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')

let _model

const convert = async (img) => {
    const image = await jpeg.decode(img, true)

    const num = 3
    const pixels = image.width * image.height
    const values = new Int32Array(pixels * num)

    for (let i = 0; i < pixels; i++)
        for (let c = 0; c < num; ++c)
            values[i * num + c] = image.data[i * 4 + c]

    return tf.tensor3d(values, [image.height, image.width, num], 'int32')
}

export default {
    start: async (m, { sock, db }) => {
        if (!db.data.chats[m.from]?.antiporn) return
        if (!['imageMessage'].includes(m.type)) return
        const image = await convert(await m.download())
        const predictions = await _model.classify(image)
        m.reply(predictions)
    }
}