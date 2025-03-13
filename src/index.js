import "../src/config.js"
import { DisconnectReason, makeInMemoryStore, useMultiFileAuthState, generateWAMessageFromContent, makeCacheableSignalKeyStore, delay, Browsers, fetchLatestBaileysVersion } from "@nazi-team/baileys"
import { Boom } from '@hapi/boom'
import pino from "pino"
import readline from "readline"
import chalk from "chalk"
import { _prototype } from "../lib/_whatsapp.js"
import { _content } from "../lib/_content.js"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = text => new Promise(resolve => rl.question(text, resolve))

const start = async () => {
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) })
    const { state, saveCreds } = await useMultiFileAuthState("./auth/session");
    const sock = _prototype({
        logger: pino({ level: "silent" }),
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
        browser: Browsers.iOS("Safari"),
        printQRInTerminal: false
    })

    store.bind(sock.ev);
    sock.ev.on("creds.update", saveCreds)
    if (!sock.authState.creds.registered) {
        console.log(`Emparejamiento con este código: ${await sock.requestPairingCode(await question("Ingresa tu número de WhatsApp activo: "), "KAORINET")}`)
    }

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        const date = new Date()
        const Time = `${date.getHours()}:${date.getMinutes()}`
        if (connection == "close") {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason == DisconnectReason.badSession) {
                console.log(chalk.bgRed(`[ ${Time} ]  Sesión inválida. Revisa la configuración de tu sesión.`));
                process.exit()
            } else if (reason == DisconnectReason.connectionClosed) {
                console.log(chalk.bgRed(`[ ${Time} ] Conexión cerrada inesperadamente. Verifica tu conexión a Internet.`))
                start()
            } else if (reason == DisconnectReason.connectionLost) {
                console.log(chalk.bgRed(`[ ${Time} ] Conexión perdida. Revisa tu red para reestablecer la conexión.`))
                start()
            } else if (reason == DisconnectReason.connectionReplaced) {
                console.log(chalk.bgRed(`[ ${Time} ] Conexión reemplazada. Otra instancia podría haber iniciado sesión.`))
                process.exit()
            } else if (reason == DisconnectReason.forbidden) {
                console.log(chalk.bgRed(`[ ${Time} ] Acceso prohibido. Verifica tus credenciales y permisos.`))

            } else if (reason == DisconnectReason.loggedOut) {
                console.log(chalk.bgRed(`[ ${Time} ] Sesión cerrada. Es necesario iniciar sesión nuevamente.`))
                process.exit()
            } else if (reason == DisconnectReason.multideviceMismatch) {
                console.log(chalk.bgRed(`[ ${Time} ] Diferencia de dispositivos. Revisa la configuración de tu sesión.`))
            } else if (reason == DisconnectReason.restartRequired) {
                console.log(chalk.bgRed(`[ ${Time} ] Es necesario reiniciar, se reiniciara automaticamente aguarde...`))
                start()
            } else if (reason == DisconnectReason.timedOut) {
                console.log(chalk.bgRed(`[ ${Time} ] Se agoto el tiempo de espera, reconectando...`))
                start()
            } else if (reason == DisconnectReason.unavailableService) {
                console.log(chalk.bgRed(`[ ${Time} ] Servicio no disponible, intentalo nuevamente mas tarde.`))
                start()
            }
            else {
                console.log(chalk.bgRed(`[ ${Time} ] Error de desconexion desconocido: ${reason}||${connection}`))
            }
        } else if (connection === "open") {
            console.log("Conexión establecida")
            rl.close()
        }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        for (let i = 0; i < messages.length; i++) {
            if (type === 'notify' && messages[i].message) {
                let m = await _content(sock, messages[i])
                let v = m?.quoted ? m.quoted : m
                let args = { sock, v, delay }

                for (const plugin of global.plugins) {
                    const isCommand = !plugin.disable && plugin.comand ? (Array.isArray(plugin.comand) ? plugin.comand.includes(m.command) : plugin.comand.test(m.body)) : undefined

                    if (plugin.exec && typeof plugin.exec === 'function' && isCommand) {
                        if (plugin.isOwner && !m.isOwner) continue
                        if (!m.isAdmin && !m.isOwner) continue

                        await plugin.exec.call(plugin, m, args).catch(error => {
                            sock.sendMessage(m.from, { text: `Error al ejecutar el plugin: ${error}` })
                            console.error(error)
                        })
                    }
                }
            }
        }
    })
}

start()