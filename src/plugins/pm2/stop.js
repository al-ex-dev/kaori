import { exec } from "child_process";

export default {
    name: 'stop',
    params: ['name'],
    desc: 'Detiene un script con PM2',
    comand: ['stop'],
    exec: async (m, { sock }) => {
        exec(`pm2 stop ${m.text}`, (err, stdout, stderr) => {
            if (err) {
                sock.sendMessage(m.from, { text: `Error al detener el script: ${err.message}` }, { quoted: m });
            } else {
                sock.sendMessage(m.from, { text: `Script ${m.text} detenido con éxito.` }, { quoted: m });
            }
        });
    },
    isOwner: true
}
