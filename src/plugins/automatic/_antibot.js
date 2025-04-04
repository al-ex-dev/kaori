export default {
    name: 'antibot',
    isGroup: true,
    start: async (m, { sock, db }) => {
        const store = new Map()
        if (/^[0-9a-fA-F]+$/.test(m.id) || (store.has(m.id) && m.timestamp - store.get(m.id) < 3)) {
            console.log(`botMessage: true`)
            return
        }
        store.set(m.id, m.timestamp)
    }
}
