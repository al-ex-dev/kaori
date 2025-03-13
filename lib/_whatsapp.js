import "../src/config.js"
import baileys, {
	jidDecode,
	makeWASocket,
	areJidsSameUser,
	jidNormalizedUser,
	downloadContentFromMessage,

} from "@nazi-team/baileys"

import { parsePhoneNumber } from "awesome-phonenumber"


export function _prototype(args, options = {}) {
	const sock = Object.defineProperties(makeWASocket(args), {
		parseMention: {
			value(text) {
				return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + "@s.whatsapp.net");
			},
			enumerable: true
		},
		decodeJid: {
			value(jid) {
				if (!jid) return jid;
				if (/:\d+@/gi.test(jid)) {
					let decode = jidDecode(jid) || {}
					return decode.user && decode.server && decode.user + "@" + decode.server || jid
				} else return jid
			},
			enumerable: true
		},
		getMessageType: {
			value(m) {
				let Type = Object.keys(m);
				if (!["senderKeyDistributionMessage", "messageContextInfo"].includes(Type[0])) { return Type[0]; }
				else if (Type.length >= 3 && Type[1] != "messageContextInfo") { return Type[1]; }
				else Type[Type.length - 1] || Object.keys(m)[0];
			},
			enumerable: true
		},
		getMessageBody: {
			value(type, msg) {
				const body = {
					conversation: () => msg,
					viewOnceMessageV2: () => msg.message.imageMessage?.caption ? msg.message.imageMessage?.caption : msg.message.videoMessage?.caption,
					imageMessage: () => msg?.caption,
					videoMessage: () => msg?.caption,
					extendedTextMessage: () => msg?.text,
					viewOnceMessage: () => msg.message.videoMessage?.caption ? msg.message.videoMessage?.caption : msg.message.imageMessage?.caption,
					documentWithCaptionMessage: () => msg.message.documentMessage?.caption,
					buttonsMessage: () => msg.imageMessage?.caption,
					buttonsResponseMessage: () => msg?.selectedButtonId,
					listResponseMessage: () => msg.singleSelectReply?.selectedRowId,
					templateButtonReplyMessage: () => msg?.selectedId,
					groupInviteMessage: () => msg?.caption,
					pollCreationMessageV3: () => msg,
					interactiveResponseMessage: () => JSON.parse(msg.nativeFlowResponseMessage?.paramsJson).id,
					text: () => msg.text
				}
				return body[type] ? body[type]() : ""
			}
		},
		getName: {
			value(jid) {
				return new Promise(async (resolve, reject) => {
					if (!jid) return;
					let id = sock.decodeJid(jid);
					let format = parsePhoneNumber(`+${id.replace("@s.whatsapp.net", "")}`);
					let v;
					if (id.endsWith("@g.us")) {
						v = await sock.groupMetadata(id).catch(_ => ({ subject: id }));
						resolve(v.subject || v.id);
					} else {
						v = (id == "0@s.whatsapp.net") ? { id, name: "Whatsapp" } : areJidsSameUser(id, sock.user.id) ? { id, name: sock.user.name } : store.contacts[id] ? store.contacts[id] : { id, name: "NPC" };
						resolve(v.name || v.verifiedName || format.number);
					}
				});
			},
			enumerable: true
		},
		resizeImage: {
			async value(path, ancho = 640, alto = 640) {
				if (!path) throw new Error('params @path required')
				const image = await Jimp.read(path)
				image.resize(ancho, alto)
				return {
					image: await image.getBufferAsync(Jimp.MIME_JPEG)
				}
			}
		},
		downloadMediaMessage: {
			async value(type, media) {
				const stream = await downloadContentFromMessage(type, media);
				let buffer = Buffer.from([]);
				for await (const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk]);
				}
				return buffer
			},
			enumerable: true
		},
		getAdmins: {
			async value(from) {
				try {
					if (!from && !from.endsWith("@g.us")) return;
					let admins = new Array();
					let { participants } = await (await sock.groupFetchAllParticipating)[from] || await store.groupMetadata[from];
					for (let i of participants) {
						if (/admin|superadmin/.test(i.admin)) admins.push(i.id);
					}
					return admins.map(i => i);
				} catch (e) {
					return [];
				}
			},
			enumerable: true
		},
		getMetadata: {
			async get() {
				let chats = await sock.groupFetchAllParticipating().catch(_ => null) || {};

				let chat = Object.keys(chats).map(i => i);

				for (let i in chats) store.groupMetadata[i] = {
					...(store.groupMetadata[i] || {}),
					...(chats[i] || {}),
					code: await sock.groupInviteCode(i).catch(_ => null) || "No es admin el bot"
				};

				Object.keys(store.groupMetadata).forEach((i) => {
					if (!chat.includes(i)) delete store.groupMetadata[i];
				});
			},
			enumerable: true
		}
	})

	if (sock.user?.id) sock.user.jid = jidNormalizedUser(sock.user.id)

	return sock
}