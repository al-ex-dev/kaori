import { exec } from 'child_process'

export default {
    name: 'exec',
    comand: ["$"],
    exec: async (m, { sock }) => {
        exec(m.text, (error, stdout, stderr) => {
            if (error) return sock.sendMessage(m.from, { text: `${error.message}` }, { quoted: m })
            if (stderr) return sock.sendMessage(m.from, { text: `${stderr}` }, { quoted: m })
            sock.sendMessage(m.from, { text: `${stdout}` }, { quoted: m })
        })
    },
    isOwner: true
}