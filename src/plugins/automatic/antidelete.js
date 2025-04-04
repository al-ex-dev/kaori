export default {
    name: 'antidelete',
    isGroup: true,
    start: async (m, { sock, db } ) => {
        if (db.data.chats[m.from]?.antidelete) {
            db.data.chats[m.from].cache ||= []
            db.data.chats[m.from].cache.push({ key: m.key, message: m.message, timestamp: Date.now() })
            db.data.chats[m.from].cache = db.data.chats[m.from].cache.filter(item => Date.now() - item.timestamp < 1200000)
        }
    }
}