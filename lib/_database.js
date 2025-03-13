import { parsePhoneNumber } from "awesome-phonenumber"
import fs from 'fs'
import { language, timezone } from "./_language.js";

export default async function database(m, { sock, db }) {

    const code = m.metadata ? await sock.groupInviteCode(m.from).catch(_ => null) : false
    let isNumber = v => typeof v == 'number' && !isNaN(v);
    let isBoolean = v => typeof v == 'boolean' && Boolean(v);

    if (m.metadata && m.from.endsWith('@g.us')) {
        let chat = db.data.chats[m.from];
        if (typeof chat !== 'object') db.data.chats[m.from] = {};

        if (chat) {
            if (!('name' in chat)) chat.name = m.metadata.subject;
            if (!('code' in chat)) chat.code = m.isBotAdmin ? code : null
            if (!isBoolean(chat.mute)) chat.mute = false
            if (typeof chat.notify !== 'object') chat.notify = {
                add: { status: false, message: "*¤* Bienvenido a @group!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc" },
                bye: { status: false, message: "*¤* Adiós @user!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc" },
                demote: { status: false, message: "*¤* Usuario degradado @user!\n\n_@action_\n\n*◈ Time:* @time\n*◈ Rol:* miembro\n\n@desc" },
                promote: { status: false, message: "*¤* Usuario promovido @user!\n\n_@action_\n\n*◈ Time:* @time\n*◈ Rol:* administrador\n\n@desc" },
                modify: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc" },
                restrict: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                announce: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                memberAddMode: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                joinApprovalMode: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                desc: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                subject: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
            }
            if (!isBoolean(chat.antiporn)) chat.antiporn = false
            if (!isBoolean(chat.antionce)) chat.antionce = false
            if (typeof chat.antilink !== 'object') chat.antilink = {
                status: false,
                platforms: {
                    youtube: { status: false, urls: ["youtube.com", "youtu.be"] },
                    facebook: { status: false, urls: ["facebook.com", "fb.com", "fb.me"] },
                    instagram: { status: false, urls: ["instagram.com", "ig.me"] },
                    tiktok: { status: false, urls: ["tiktok.com", "vm.tiktok.com"] },
                    twitter: { status: false, urls: ["twitter.com", "t.co", "x.com"] },
                    reddit: { status: false, urls: ["reddit.com", "redd.it"] },
                    pinterest: { status: false, urls: ["pinterest.com", "pin.it"] },
                    snapchat: { status: false, urls: ["snapchat.com", "sc.snapchat.com"] },
                    telegram: { status: false, urls: ["t.me", "telegram.dog"] },
                    whatsapp: { status: false, urls: ["whatsapp.com", "wa.me", "wa.link"] },
                    discord: { status: false, urls: ["discord.com", "discord.gg"] },
                    spotify: { status: false, urls: ["spotify.com", "spoti.fi"] }
                }
            }
            if (!isBoolean(chat.antifake)) chat.antifake = false
            if (!isBoolean(chat.antitoxic)) chat.antitoxic = false
            if (!isBoolean(chat.antidelete)) chat.antidelete = false
            if (typeof chat.link !== 'object') chat.link = []
            if (typeof chat.fake !== 'object') chat.fake = []
            if (typeof chat.cache !== 'object') chat.cache = []
        } else {
            db.data.chats[m.from] = {
                name: m.metadata.subject,
                code: m.isBotAdmin ? code : null,
                mute: false,
                notify: {
                    add: { status: false, message: "*¤* Bienvenido a @group!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc" },
                    bye: { status: false, message: "*¤* Adiós @user!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc" },
                    demote: { status: false, message: "*¤* Usuario degradado @user!\n\n_@action_\n\n*◈ Time:* @time\n*◈ Rol:* miembro\n\n@desc" },
                    promote: { status: false, message: "*¤* Usuario promovido @user!\n\n_@action_\n\n*◈ Time:* @time\n*◈ Rol:* administrador\n\n@desc" },
                    modify: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time\n\n@desc" },
                    restrict: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                    announce: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                    memberAddMode: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                    joinApprovalMode: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                    desc: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                    subject: { status: false, message: "*¤* Grupo modificado!\n\n_@action_\n\n*◈ Time:* @time" },
                },
                antiporn: false,
                antionce: false,
                antilink: {
                    status: false,
                    platforms: {
                        youtube: { status: false, urls: ["youtube.com", "youtu.be"] },
                        facebook: { status: false, urls: ["facebook.com", "fb.com", "fb.me"] },
                        instagram: { status: false, urls: ["instagram.com", "ig.me"] },
                        tiktok: { status: false, urls: ["tiktok.com", "vm.tiktok.com"] },
                        twitter: { status: false, urls: ["twitter.com", "t.co", "x.com"] },
                        reddit: { status: false, urls: ["reddit.com", "redd.it"] },
                        pinterest: { status: false, urls: ["pinterest.com", "pin.it"] },
                        snapchat: { status: false, urls: ["snapchat.com", "sc.snapchat.com"] },
                        telegram: { status: false, urls: ["t.me", "telegram.dog"] },
                        whatsapp: { status: false, urls: ["whatsapp.com", "wa.me", "wa.link"] },
                        discord: { status: false, urls: ["discord.com", "discord.gg"] },
                        spotify: { status: false, urls: ["spotify.com", "spoti.fi"] }
                    }
                },
                antifake: false,
                antitoxic: false,
                antidelete: false,
                link: [],
                fake: [],
                cache: [],
                games: []
            }
        }
    }

    if ((m.sender.endsWith('@s.whatsapp.net'))) {
        let user = db.data.users[m.sender];
        if (typeof user != 'object') db.data.users[m.sender] = {}

        const country = parsePhoneNumber(`+${m.sender.replace("@s.whatsapp.net", "")}`).regionCode

        if (user) {
            if (!('name' in user)) user.name = m.pushName
            if (!('number' in user)) user.number = m.sender
            if (!('language' in user)) user.language = language[country]
            if (!('timezone' in user)) user.timezone = timezone[country]
            if (!('country' in user)) user.country = country || 'PE'
            if (!('premium' in user) || typeof user.premium != 'object') user.premium = { level: 0, time: 0 }
            if (!isBoolean(user.registered)) user.registered = false
            if (!isBoolean(user.blacklist)) user.blacklist = false
            if (!isNumber(user.count)) user.count = 0
            if (!isNumber(user.level)) user.level = 1
            if (!isNumber(user.koins)) user.koins = 1000
            if (!isNumber(user.requests)) user.requests = 50
            if (!isNumber(user.warnings)) user.warnings = 0
            user.count += 1
        } else {
            db.data.users[m.sender] = {
                name: m.pushName,
                number: m.sender,
                language: language[country] || 'en',
                timezone: timezone[country],
                country: country,
                premium: {
                    level: 0,
                    time: 0,
                },
                registered: false,
                blacklist: false,
                count: 0,
                level: 1,
                koins: 1000,
                requests: 50,
                warnings: 0,
            }
        }
    }

    let bot = db.data.settings[sock.user.jid]
    if (typeof bot != 'object') db.data.settings[sock.user.jid] = {}

    if (bot) {
        if (!('name' in bot)) bot.name = sock.user.name || await sock.getName(sock.user.jid)
        if (!('language' in bot)) bot.language = 'en'
        if (!isBoolean(bot.private)) bot.private = false
        if (!isBoolean(bot.dev)) bot.dev = false
        if (!isBoolean(bot.autobio)) bot.autobio = false
        if (!isBoolean(bot.autorestart)) bot.autorestart = false
        if (typeof bot.prefix != 'object') bot.prefix = prefix
    } else {
        db.data.settings[sock.user.jid] = {
            name: sock.user.name || await sock.getName(sock.user.jid),
            language: 'en',
            private: false,
            dev: false,
            autobio: false,
            autorestart: false,
            prefix: _config.prefix,
        };
    }

    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
}