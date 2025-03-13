export default {
    name: 'group',
    params: ['open/close/edit/noedit'],
    description: 'Gestionar configuraciones del grupo',
    comand: ['group', 'gp', 'grupo'],
    exec: async (m, { sock }) => {
        if (!m.isBotAdmin) return sock.sendMessage(m.from, { text: 'El bot no es administrador.' }, { quoted: m });
        if (!m.isAdmin) return sock.sendMessage(m.from, { text: 'No eres administrador.' }, { quoted: m });

        const action = m.args[0];
        const metadata = await sock.groupMetadata(m.from);

        if (["cerrar", "close"].includes(action)) {
            if (metadata.announce) return sock.sendMessage(m.from, { text: 'El grupo ya está cerrado.' }, { quoted: m });
            await sock.groupSettingUpdate(m.from, "announcement");
            await sock.sendMessage(m.from, { text: 'Grupo cerrado con éxito.' }, { quoted: m });
        } else if (["abrir", "open"].includes(action)) {
            if (!metadata.announce) return sock.sendMessage(m.from, { text: 'El grupo ya está abierto.' }, { quoted: m });
            await sock.groupSettingUpdate(m.from, "not_announcement");
            await sock.sendMessage(m.from, { text: 'Grupo abierto con éxito.' }, { quoted: m });
        } else if (["edit", "modify"].includes(action)) {
            if (!metadata.restrict) return sock.sendMessage(m.from, { text: 'El grupo ya permite edición.' }, { quoted: m });
            await sock.groupSettingUpdate(m.from, "unlocked");
            await sock.sendMessage(m.from, { text: 'Edición permitida en el grupo.' }, { quoted: m });
        } else if (["noedit", "nomodify"].includes(action)) {
            if (metadata.restrict) return sock.sendMessage(m.from, { text: 'El grupo ya no permite edición.' }, { quoted: m });
            await sock.groupSettingUpdate(m.from, "locked");
            await sock.sendMessage(m.from, { text: 'Edición no permitida en el grupo.' }, { quoted: m });
        }
    },
    isAdmin: true,
    isBotAdmin: true,
    isGroup: true
}
