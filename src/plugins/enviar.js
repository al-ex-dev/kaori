import fs from 'fs';
import path from 'path';

export default {
    name: 'enviar',
    description: 'Envía mensajes a la lista de números agregados',
    comand: ['enviar'],
    exec: async (m, { sock, delay }) => {
        const GROUPJID = "120363244235096720@g.us"
        const filePath = path.join(global.origen, 'temp.json')

        const temp = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : []

        let [sent, exist, numbers] = [0, 0, []]

        await Promise.all(temp.map(async (n) => {
            const number = `${n.replace(/\D/g, '')}@s.whatsapp.net`
            const valid = await sock.onWhatsApp(number).then(([w]) => w?.jid).catch(() => null)
            if (!valid) {
                exist++
                numbers.push(number)
                return
            }
            await sock.sendMessage(number, {
                text: "¿Recibirá el paquete?",
                footer: _config.bot.credits,
                buttons: [{
                    buttonId: 'si',
                    buttonText: { displayText: 'Sí, recibiré el paquete' },
                    type: 1
                }, {
                    buttonId: 'no',
                    buttonText: { displayText: 'No, no recibiré el paquete' },
                    type: 1
                }],
                headerType: 1,
                viewOnce: true
            })
            await delay(7000)
            sent++
        }))

        await sock.sendMessage(m.from, {
            text: `📊 Estadísticas de envío:\n• Total en lista: ${temp.length}\n• Enviados: ${sent}\n• Sin WhatsApp: ${exist}\n📝 Números inválidos: ${numbers.join(', ') || 'Ninguno'}`,
        })

        const responses = async (response) => {
            const msg = response.messages?.[0]
            if (msg?.message?.buttonsResponseMessage) {
                const number = msg.key.remoteJid.replace('@s.whatsapp.net', '')
                const id = msg.message.buttonsResponseMessage.selectedButtonId

                if (id === 'si') {
                    await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor escriba la dirección del domicilio para confirmar la entrega.'})

                    const address = async (addressResponse) => {
                        const msg = addressResponse.messages?.[0]
                        if (msg?.key.remoteJid === msg.key.remoteJid && msg.message?.conversation) {
                            await sock.sendMessage(GROUPJID, { text: `📦 +${number} recibirá el paquete. Dirección: ${msg.message.conversation}` })
                            await sock.sendMessage(msg.key.remoteJid, { text: 'Gracias por su respuesta.'})
                            sock.ev.off('messages.upsert', address)
                        }
                    }

                    sock.ev.on('messages.upsert', address)
                } else if (id === 'si') {
                    await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor indique la razón por la cual no recibirá el paquete.'})

                    const reason = async (mess) => {
                        const msg = mess.messages?.[0]
                        if (msg?.key.remoteJid === msg.key.remoteJid && msg.message?.conversation) {
                            await sock.sendMessage(GROUPJID, { text: `❌ +${number} no recibirá el paquete. Razón: ${msg.message.conversation}`})
                            await sock.sendMessage(msg.key.remoteJid, { text: 'Gracias por su respuesta.'})
                            sock.ev.off('messages.upsert', reason)
                        }
                    }

                    sock.ev.on('messages.upsert', reason)
                }

                sock.ev.off('messages.upsert', responses)
            }
        }

        sock.ev.on('messages.upsert', responses)
    }
}