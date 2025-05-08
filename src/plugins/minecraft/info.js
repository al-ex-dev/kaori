import Rcon from 'rcon';

export default {
    name: 'info',
    description: 'Obtiene información del servidor de Minecraft',
    comand: ['info'],
    exec: async (m, { sock }) => {
        const rcon = new Rcon('localhost', 25575, 'a');
        rcon.on('auth', () => {
            rcon.send('list');
        }).on('response', (response) => {
            sock.sendMessage(m.from, { text: `✅ Información del servidor:\n${response}` }, { quoted: m });
            rcon.disconnect();
        }).on('error', (err) => {
            sock.sendMessage(m.from, { text: `❌ Error: ${err.message}` }, { quoted: m });
        });
        rcon.connect();
    }
};
