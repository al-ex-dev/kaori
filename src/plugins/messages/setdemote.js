export default {
    name: 'setdemote',
    params: ['message'],
    description: 'Modificar el mensaje de degradación',
    comand: ['setdemote'],
    exec: async (m, { sock, db }) => {
        const chat = db.data.chats[m.from];
        if (!chat) return sock.sendMessage(m.from, { text: 'Chat no encontrado.' });
        const message = m.text;
        if (!message) return sock.sendMessage(m.from, { text: 'Mensaje inválido.' });
        chat.messages.demote = message;
        await sock.sendMessage(m.from, { text: 'Mensaje de degradación actualizado.' });
    },
    isOwner: true
}
