import { exec } from 'child_process';

export default {
    name: 'restart',
    description: 'Reinicia el servidor de Minecraft',
    comand: ['mrestart'],
    exec: async (m, { sock }) => {
        exec('systemctl restart minecraft', (error, stdout, stderr) => {
            const response = error ? `❌ Error: ${stderr}` : '✅ El servidor de Minecraft se está reiniciando.';
            sock.sendMessage(m.from, { text: response }, { quoted: m });
        });
    }
};
