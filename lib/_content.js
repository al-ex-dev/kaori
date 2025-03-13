import baileys, {
    jidNormalizedUser,
    getContentType,
    extractMessageContent
} from "@nazi-team/baileys"

export const _content = async (sock, m) => {
    let Proto = baileys.proto.WebMessageInfo.fromObject

    if (m.key.remoteJid == "status@broadcast" || m.broadcast || !m.message) return
    if (m.key.id.startsWith("NZT") || m.key.id.startsWith("BAE5")) return
    
    m.message = (Object.keys(m.message)[0] == "ephemeralMessage") ? m.message["ephemeralMessage"].message : (Object.keys(m.message)[0] == "viewOnceMessageV2") ? m.message["viewOnceMessageV2"].message : (Object.keys(m.message)[0] == "documentWithCaptionMessage") ? m.message["documentWithCaptionMessage"].message : (Object.keys(m.message)[0] == "ptvMessage") ? { videoMessage: m.message["ptvMessage"] } : m.message

    if (m.message.senderKeyDistributionMessage) delete m.message.senderKeyDistributionMessage
    if (m.message.messageContextInfo) delete m.message.messageContextInfo

    if (m.key) {
        m.id = m.key.id
        m.device = m.id.length > 28 ? 'android' : m.id.substring(0, 2) === '3A' ? 'ios' : m.id.startsWith("BAE5") ? 'baileys' : m.id.startsWith("3EB0") ? 'web' : 'desconocido';
        m.isBot = (m.id.startsWith("3EB0") && m.id.length == 12) || (m.id.startsWith("BAE5") && m.id.length == 16)
        m.from = m.key.remoteJid
        m.isMe = m.key.fromMe
        m.isGroup = m.from.endsWith("@g.us")
        m.isChat = m.from.endsWith("@s.whatsapp.net")
        m.isNewsletter = m.from.endsWith("@newsletter")
        m.sender = jidNormalizedUser(m.key.participant || m.key.remoteJid)
        m.number = m.sender.replace("@s.whatsapp.net", "")
        m.pushName = m.pushName || "Sin Nombre"
        m.isOwner = m.isMe || (m.number === _config.owner.number) || _config.mods.some(i => i === m.number)
        m.data = (id) => global.db.data.chats[id] || global.db.data.settings[id] || global.db.data.users[id]
        if (m.isGroup && !m.isNewsletter) {
            m.metadata = m.from.endsWith("@g.us") ? await sock.groupMetadata(m.from) : false
            m.admins = m.from.endsWith("@g.us") ? m.metadata.participants.filter(i => i.admin == "admin" || i.admin == "superadmin").map(i => i.id) : false
            m.isAdmin = m.from.endsWith("@g.us") ? m.admins.includes(m.sender) : false
            m.isBotAdmin = m.from.endsWith("@g.us") ? m.admins.includes(sock.user.jid) : false
        }
    };

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = extractMessageContent(m.message?.[m.type])
        m.isViewOnce = m?.msg?.viewOnce ? m?.msg?.viewOnce : false
        m.isMedia = ["image", "sticker", "video", "audio"].some(i => m.type && i == m.type.replace("Message", ""))
        m.body = typeof sock.getMessageBody(m.type, m.msg) === 'string' ? sock.getMessageBody(m.type, m.msg) : ''
        m.cmd = typeof m.body === 'string' && _config.prefix.some(i => m.body.toLowerCase().startsWith(i.toLowerCase()))
        m.command = m.cmd ? m.body.slice(1).trim().split(/\s+/).shift().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : false
        m.args = m.body.trim().split(/\s+/).slice(m.cmd ? 1 : 0)
        m.text = m.args.join(" ")

        let protocolMessageKey
        if (m.type == 'protocolMessage' && m.msg?.key) {
            protocolMessageKey = m.msg.key
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.from
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
            protocolMessageKey.fromMe = sock.decodeJid(protocolMessageKey.participant) === sock.decodeJid(sock.user.id)
            if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === sock.decodeJid(sock.user.id)) protocolMessageKey.remoteJid = m.sender
        }

        if (protocolMessageKey && m.type == 'protocolMessage') {
            sock.ev.emit('message.delete', { key: protocolMessageKey })
        }

        let quotedMention = m.msg?.contextInfo != null ? m.msg.contextInfo?.participant : ''
        let tagMention = m.msg?.contextInfo != undefined ? m.msg.contextInfo?.mentionedJid : []
        let mention = typeof (tagMention) == 'string' ? [tagMention] : tagMention
        mention != undefined ? mention.push(quotedMention) : []

        m.mentionedJid = mention != undefined ? mention.filter(x => x) : []
        m.delete = () => sock.sendMessage(m.from, { delete: m.key })
        m.react = emoji => sock.sendMessage(m.from, { react: { text: emoji, key: m.key } })
        m.download = () => sock.downloadMediaMessage(m.message[m.type], m.type.replace('Message', ''))

        m.quoted = (m.msg?.contextInfo && Object.keys(m.msg.contextInfo).some(i => i == "quotedMessage")) ? Proto({ key: { remoteJid: m.from || m.key.remoteJid, fromMe: (m.msg.contextInfo.participant == sock.user.jid), id: m.msg.contextInfo.stanzaId, participant: m.msg.contextInfo.participant }, message: m.msg.contextInfo.quotedMessage }) : false;

        if (m.quoted) {
            if (m.quoted.key) {
                m.quoted.id = m.quoted.key.id
                m.quoted.device = m.quoted.id.length > 28 ? 'android' : m.quoted.id.substring(0, 2) === '3A' ? 'ios' : m.quoted.id.startsWith("BAE5") ? 'baileys' : m.quoted.id.startsWith("3EB0") ? 'web' : 'desconocido'
                m.quoted.isBot = (m.quoted.id.startsWith("3EB0") && m.quoted.id.length == 12) || (m.quoted.id.startsWith("BAE5") && m.quoted.id.length == 16)
                m.quoted.isMe = m.quoted.key.fromMe
                m.quoted.sender = jidNormalizedUser(m.quoted.key.participant || m.quoted.key.remoteJid)
                m.quoted.number = m.quoted.sender.replace("@s.whatsapp.net", "")
                m.quoted.isOwner = m.quoted.isMe || (m.quoted.number == _config.owner.number) || _config.mods.some(i => i == m.quoted.number)
                m.quoted.isAdmin = m.admins ? m.admins.includes(m.quoted.sender) : false
            }

            m.quoted.message = (Object.keys(m.quoted.message)[0] == "ephemeralMessage") ? m.quoted.message["ephemeralMessage"].message : (Object.keys(m.quoted.message)[0] == "viewOnceMessageV2") ? m.quoted.message["viewOnceMessageV2"].message : (Object.keys(m.quoted.message)[0] == "documentWithCaptionMessage") ? m.quoted.message["documentWithCaptionMessage"].message : (Object.keys(m.quoted.message)[0] == "ptvMessage") ? { videoMessage: m.quoted.message["ptvMessage"] } : m.quoted.message

            if (m.quoted.message) {
                m.quoted.type = getContentType(m.quoted.message)
                m.quoted.msg = extractMessageContent(m.quoted.message?.[m.quoted.type])
                m.quoted.isViewOnce = m?.quoted?.msg?.viewOnce ? m?.quoted?.msg?.viewOnce : false
                m.quoted.isMedia = ["image", "sticker", "video", "audio"].some(i => m.quoted.type && i == m.quoted.type.replace("Message", ""))
                m.quoted.body = typeof sock.getMessageBody(m.quoted.type, m.quoted.msg) === 'string' ? sock.getMessageBody(m.quoted.type, m.quoted.msg) : ''
                m.quoted.cmd = typeof m.quoted.body === 'string' && _config.prefix.some(i => m.quoted.body.toLowerCase().startsWith(i.toLowerCase()))
                m.quoted.command = m.quoted.cmd ? m.quoted.body.slice(1).trim().split(/\s+/).shift().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : false
                m.quoted.args = m.quoted.body.trim().split(/\s+/).slice(m.cmd ? 1 : 0)
                m.quoted.text = m.quoted.args.join(" ")
            }

            m.quoted.delete = () => sock.sendMessage(m.from, { delete: m.quoted.key })
            m.quoted.react = emoji => sock.sendMessage(m.from, { react: { text: emoji, key: m.quoted.key } })
            m.quoted.download = () => sock.downloadMediaMessage(m.quoted.message[m.quoted.type], m.quoted.type.replace('Message', ''))
        }
    }
    m.reply = async (text, options = {}, quoted = m) => {
        let p = [1, 0]
        p = p[Math.floor(Math.random() * p.length)];

        return await sock.sendMessage(options.id ? options.id : m.from, {
            text: text,
            contextInfo: {
                mentionedJid: options.mentions ? options.mentions : sock.parseMention(text),
                externalAdReply: {
                    renderLargerThumbnail: options.render ? options.render : false,
                    showAdAttribution: options.adAttrib ? options.adAttrib : false,
                    body: options.body ? options.body : _config.bot.name + " - " + _config.bot.version,
                    mediaType: 1,
                    thumbnailUrl: options.img ? options.img : "https://files.catbox.moe/o1y3t5.png",
                    sourceUrl: (p == 1) ? "https://instagram.com/al.e.dev" : "https://www.github.com/al-e-dev"
                }
            }
        }, {
            quoted: options.quoted ? options.quoted : null,
            ephemeralExpiration: 20 * 60 * 100,
            disappearingMessagesInChat: 20 * 60 * 100
        })
    }

    return m
}
