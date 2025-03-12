const nsfwjs = require('nsfwjs')
const tf = require('@tensorflow/tfjs-node')

// Variable para almacenar el modelo cargado
let model

export default {
    start: async (m, { sock, db }) => {
        if (db.data.chats[m.from]?.antiporn) {
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage']
            
            if (supportedTypes.includes(m.type)) {
                try {
                    // Cargar el modelo solo una vez
                    if (!model) {
                        model = await nsfwjs.load()
                    }
                    
                    // Obtener el contenido multimedia
                    let buffer
                    if (m.type === 'videoMessage') {
                        // Usar el thumbnail del video
                        buffer = m.message?.videoMessage?.jpegThumbnail
                        if (!buffer) return
                    } else {
                        buffer = await m.download()
                    }

                    // Convertir a tensor
                    const image = await tf.node.decodeImage(buffer, 3)
                    
                    // Clasificar contenido
                    const predictions = await model.classify(image)
                    image.dispose() // Liberar memoria

                    // Umbral de detección (ajustable)
                    const nsfwThreshold = 0.75
                    const nsfwDetected = predictions.some(p => 
                        ['Porn', 'Hentai'].includes(p.className) && 
                        p.probability >= nsfwThreshold
                    )

                    if (nsfwDetected) {
                        await sock.sendMessage(m.from, { 
                            text: '🚨 Contenido NSFW detectado y eliminado'
                        })
                        
                        await sock.sendMessage(m.from, { 
                            delete: { 
                                remoteJid: m.from, 
                                fromMe: false, 
                                id: m.id, 
                                participant: m.sender 
                            } 
                        })
                        
                        // Opcional: Eliminar al usuario del grupo
                        // if (m.isGroup) {
                        //     await sock.groupParticipantsUpdate(
                        //         m.from, 
                        //         [m.sender], 
                        //         "remove"
                        //     )
                        // }
                    }
                } catch (error) {
                    console.error('Error en detección NSFW:', error)
                }
            }
        }
    }
}