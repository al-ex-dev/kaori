import { exec } from 'child_process';

export default {
    name: 'status',
    description: 'Verifica el estado del servidor de Minecraft',
    comand: ['mstatus'],
    exec: async (m, { sock }) => {
        exec('systemctl status minecraft', (error, stdout, stderr) => {
            const response = error ? `❌ Error: ${stderr}` : `✅ Estado del servidor:\n${stdout}`;
            sock.sendMessage(m.from, { text: response }, { quoted: m });
        });
    }
};
