import "../src/config.js"
import { DisconnectReason, makeInMemoryStore, useMultiFileAuthState, generateWAMessageFromContent, makeCacheableSignalKeyStore, delay, Browsers, fetchLatestBaileysVersion } from "@nazi-team/baileys"
import { Boom } from '@hapi/boom'
import pino from "pino"
import readline from "readline"
import chalk from "chalk"
import axios from "axios"
import { _prototype } from "../lib/_whatsapp.js"
import { _content } from "../lib/_content.js"
import { Lang } from "../lib/_language.js"
import Func from "../lib/_functions.js"
import Scrap from "./scraper/index.js"
import os from "os"

const platform = os.platform()
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = text => new Promise(resolve => rl.question(text, resolve))

const start = async () => {
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) })
    const { state, saveCreds } = await useMultiFileAuthState("./auth/session");
    const sock = _prototype({
        logger: pino({ level: "silent" }),
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
        browser: Browsers.iOS("Safari"),
        printQRInTerminal: false,
        emitOwnEvents: true,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: false,
        linkPreviewImageThumbnailWidth: 192,
        receivedPendingNotifications: false,
        getMessage: async (msg) => {
            if (store) {
                const m = await store.loadMessage(msg.remoteJid, msg.id);
                return m?.message || undefined
            }
        },
        keepAliveIntervalMs: 30_000,
        syncFullHistory: false,
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

    sock.ev.on("group-participants.update", async ({ id, author, participants, action }) => {
        if (!action || !db.data.chats[id]?.notify[action]?.status || author?.endsWith("@lid")) return

        const { subject, desc } = await sock.groupMetadata(id)

        const messages = {
            add: p => author ? `Fuiste añadido por @${author.split`@`[0]}` : `Te uniste mediante enlace`,
            remove: p => author === p ? `Salió del grupo` : `Eliminado por @${author.split`@`[0]}`,
            promote: () => `Promovido por @${author.split`@`[0]}`,
            demote: () => `Degradado por @${author.split`@`[0]}`,
            modify: () => `Configuración modificada`
        }

        const images = {
            add: "./src/media/welcome.png",
            remove: "./src/media/goodbye.png",
            promote: "./src/media/promote.png",
            demote: "./src/media/demote.png",
            modify: "./src/media/modify.png"
        }

        for (const p of participants) {
            const group = db.data.chats[id]
            const fake = p.split('@')[0]
            if (group.antifake && action === 'add' && group.fake.some(i => fake.startsWith(i))) {
                await sock.sendMessage(id, { text: 'Tu número se encuentra en la lista negra, serás eliminado automáticamente.' })
                await sock.groupParticipantsUpdate(id, [p], 'remove')

                continue
            }
            await sock.sendMessage(id, {
                image: { url: images[action] },
                caption: db.data.chats[id].notify[action].message?.replace(/(@group|@action|@user|@time|@desc)/g, match => ({
                    '@group': `@${id}`,
                    '@action': messages[action]?.(p),
                    '@user': `@${p.split`@`[0]}`,
                    '@time': new Date().toLocaleString(),
                    '@desc': desc
                }[match])),
                footer: _config.bot.credits,
                interactiveButtons: [{ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "site", url: "https://ktxoo.xyz" }) }],
                contextInfo: {
                    remoteJid: id,
                    mentionedJid: [p, author].filter(Boolean),
                    groupMentions: [{ groupJid: id, groupSubject: subject }]
                }
            })
        }
    })

    sock.ev.on("groups.update", async updates => {
        for (const { id, author, ...props } of updates) {
            if (!db.data.chats[id]?.notify) continue
            const { subject } = await sock.groupMetadata(id)
            const messages = {
                restrict: v => `ha ${v ? "restringido" : "permitido"} permisos del grupo`,
                announce: v => `ha ${v ? "cerrado" : "abierto"} el grupo`,
                memberAddMode: v => `ha ${v ? "habilitado" : "deshabilitado"} agregar participantes`,
                joinApprovalMode: v => `ha ${v ? "activado" : "desactivado"} aprobación de solicitudes`,
                desc: v => `ha cambiado la descripción: "${v}"`,
                subject: v => `ha cambiado el nombre del grupo: "${v}"`
            }
            for (const [key, value] of Object.entries(props)) {
                if (!messages[key] || value === undefined) continue
                await sock.sendMessage(id, {
                    image: { url: "./src/media/kaori.png" },
                    caption: db.data.chats[id].notify[key]?.message?.replace(/(@group|@action|@user|@time)/g, match => ({
                        '@group': `@${id}`,
                        '@action': messages[key]?.(value),
                        '@user': `@${author.split`@`[0]}`,
                        '@time': new Date().toLocaleString(),
                    }[match])),
                    footer: _config.bot.credits,
                    interactiveButtons: [{ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "site", url: "https://ktxoo.xyz" }) }],
                    contextInfo: {
                        remoteJid: id,
                        mentionedJid: [author],
                        groupMentions: [{ groupJid: id, groupSubject: subject }]
                    }
                })
            }
        }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        for (let i = 0; i < messages.length; i++) {
            if (type === 'notify' && messages[i].message) {
                let m = await _content(sock, messages[i])
                let v = m?.quoted ? m.quoted : m
                let lang = db.data.users[m?.sender] ? Lang[db.data.users[m?.sender].language] : Lang[db.data.settings[sock.user.jid]?.language]
                let args = { sock, db, v, lang, delay, Func, Scrap }

                console.log(JSON.stringify(m.message, null, 2))

                for (const plugin of global.plugins) {
                    const isCommand = !plugin.disable && plugin.comand ? (Array.isArray(plugin.comand) ? plugin.comand.includes(m.command) : plugin.comand.test(m.body)) : undefined

                    if (plugin.exec && typeof plugin.exec === 'function' && isCommand) {
                        if (plugin.isOwner && !m.isOwner) continue
                        if (db.data.settings[sock.user.jid]?.private && !m.isOwner) continue
                        if (db.data.chats[m.from]?.mute && !m.isAdmin && !m.isOwner) continue

                        if (plugin.isAdmin && !m.isAdmin) return m.reply("*Este comando solo está disponible para administradores del grupo.*")
                        if (plugin.isBotAdmin && !m.isBotAdmin) return m.reply("*El bot necesita ser administrador para ejecutar este comando.*")

                        if (plugin.isPrivate && m.isGroup) return m.reply("*Este comando solo puede ser usado en chats privados.*")
                        if (plugin.isGroup && !m.isGroup) return m.reply("*Este comando solo está disponible para grupos.*")

                        if (plugin.os && platform === 'win32') return m.reply(`*Este comando no está disponible debido a la incompatibilidad del sistema operativo en el que se ejecuta ${_config.bot.name}.*`)
                        if (plugin.params && plugin.params.length > 0 && !plugin.params.every(param => m.text && m.text.split(' ')[plugin.params.indexOf(param)])) return m.reply(`*Por favor, proporcione los parámetros requeridos: ${plugin.params.map(p => `[${p}]`).join(' ')}.*`)
                        if (plugin.isQuoted && !m.quoted) return m.reply("*Por favor, responda a un mensaje para usar este comando.*")
                        if (plugin.isMedia && !plugin.isMedia?.includes(v.type.replace('Message', ''))) return m.reply(`*Por favor, adjunte un contenido multimedia de tipo ${plugin.isMedia.length === 1 ? plugin.isMedia[0] : plugin.isMedia.slice(0, -1).join(', ') + ' o ' + plugin.isMedia.slice(-1)} para procesar su solicitud.*`);

                        await plugin.exec.call(plugin, m, args).catch(error => {
                            sock.sendMessage(m.from, { text: `Error al ejecutar el plugin: ${error}` })
                            console.error(error)
                        })
                    }

                    if (plugin.start && typeof plugin.start === 'function' && !isCommand) {
                        if (plugin.isGroup && !m.isGroup) {
                            continue
                        }
                        await plugin.start.call(plugin, m, args)
                    }
                }
            }
        }
    })

    sock.ev.on("message.delete", async ({ key: { remoteJid, id, participant } }) => {
        const cache = db.data.chats[remoteJid]?.cache?.find(item => item.key.id === id)
        if (!cache) return

        const participantId = participant.split('@')[0]
        await sock.sendMessage(remoteJid, { text: `Mensaje eliminado por @${participantId}. Recuperando contenido...`, contextInfo: { mentionedJid: [participant] } })

        if (cache.message?.conversation) return await sock.sendMessage(remoteJid, { text: `Contenido eliminado:\n${cache.message.conversation}` })

        const [messageType] = Object.keys(cache.message)
        const messageContent = cache.message[messageType]

        if (typeof messageContent === 'object') {
            const quotedMsg = {
                extendedTextMessage: {
                    text: `Eliminado por @${participantId}`,
                    contextInfo: { mentionedJid: [participant] }
                }
            }

            messageContent.contextInfo = {
                participant: "13135550002@s.whatsapp.net",
                quotedMessage: quotedMsg,
                remoteJid: remoteJid && participant,
                ...messageContent.contextInfo,
                mentionedJid: [participant, ...(messageContent.contextInfo?.mentionedJid || []), "13135550002@s.whatsapp.net"]
            }

            await sock.relayMessage(remoteJid, generateWAMessageFromContent(remoteJid, cache.message, { userJid: sock.user.id }).message, { messageId: cache.key.id })
        }
    })

}

start()