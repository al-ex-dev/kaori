export default {
    name: 'setbye',
    params: ['message'],
    description: 'Modificar el mensaje de despedida',
    comand: ['setbye'],
    exec: async (m, { sock, db }) => {
        const chat = db.data.chats[m.from];
        if (!chat) return sock.sendMessage(m.from, { text: 'Chat no encontrado.' });
        const message = m.text;
        if (!message) return sock.sendMessage(m.from, { text: 'Mensaje inválido.' });
        chat.messages.remove = message;
        await sock.sendMessage(m.from, { text: 'Mensaje de despedida actualizado.' });
    },
    isOwner: true
}
