import { exec } from "child_process";

export default {
    name: 'start',
    params: ['name'],
    desc: 'Inicia un script con PM2',
    comand: ['start'],
    exec: async (m, { sock }) => {
        exec(`pm2 start ${m.text}`, (err, stdout, stderr) => {
            if (err) {
                sock.sendMessage(m.from, { text: `Error al iniciar el script: ${err.message}` }, { quoted: m });
            } else {
                sock.sendMessage(m.from, { text: `Script ${m.text} iniciado con éxito.` }, { quoted: m });
            }
        });
    },
    isOwner: true
}
