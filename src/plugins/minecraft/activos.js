import Rcon from 'rcon';

export default {
    name: 'activos',
    description: 'Lista los jugadores conectados al servidor de Minecraft',
    comand: ['mactivos'],
    exec: async (m, { sock }) => {
        const rcon = new Rcon('localhost', 25575, 'a');
        rcon.on('auth', () => {
            rcon.send('list');
        }).on('response', (response) => {
            const players = response.includes(':') ? response.split(':')[1].trim() : 'Ningún jugador conectado.';
            sock.sendMessage(m.from, { text: `✅ Jugadores conectados:\n${players}` }, { quoted: m });
            rcon.disconnect();
        }).on('error', (err) => {
            sock.sendMessage(m.from, { text: `❌ Error: ${err.message}` }, { quoted: m });
        });
        rcon.connect();
    }
};
