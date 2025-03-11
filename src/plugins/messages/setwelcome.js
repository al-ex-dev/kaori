export default {
    name: 'setwelcome',
    params: ['message'],
    description: 'Modificar el mensaje de bienvenida',
    comand: ['setwelcome'],
    exec: async (m, { sock, db }) => {
        const chat = db.data.chats[m.from];
        if (!chat) return sock.sendMessage(m.from, { text: 'Chat no encontrado.' });
        const message = m.text;
        if (!message) return sock.sendMessage(m.from, { text: 'Mensaje inválido.' });
        chat.messages.add = message;
        await sock.sendMessage(m.from, { text: 'Mensaje de bienvenida actualizado.' });
    },
    isOwner: true
}