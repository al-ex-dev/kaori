export default {
    name: 'rpgsell',
    description: 'Vende los recursos obtenidos en trabajos y gana monedas.',
    command: ['sell'],
    exec: async (m, { sock, db, args }) => {
        const user = db.data.users[m.sender]?.games.find(g => g.role);
        if (!user)
            return await sock.sendMessage(m.from, { text: "⚠️ Primero elige un rol con `.role`." }, { quoted: m });

        if (!args[0])
            return await sock.sendMessage(m.from, { text: "💰 Usa `.sell <recurso> <cantidad>` para vender." }, { quoted: m });

        const prices = {
            "Hierro": 5, "Cobre": 7, "Estaño": 6, "Salitre": 8, "Carbón": 4,
            "Arcilla": 3, "Piedra": 2, "Madera": 3, "Fibra": 2, "Cuarzo": 10,
            "Oro": 20, "Artefactos": 30, "Hierbas": 5, "Semillas": 3, "Bayas": 4,
            "Resina": 6, "Carne": 8, "Piel": 5, "Huesos": 3, "Pescado": 7,
            "Plumas": 4
        };

        const item = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
        const amount = parseInt(args[1]) || 1;
        if (!prices[item])
            return await sock.sendMessage(m.from, { text: "❌ No puedes vender ese recurso." }, { quoted: m });

        if (!user.resources[item] || user.resources[item] < amount)
            return await sock.sendMessage(m.from, { text: `❌ No tienes suficiente *${item}* para vender.` }, { quoted: m });

        const earnings = prices[item] * amount
        user.resources[item] -= amount
        user.money = (user.money || 0) + earnings

        await sock.sendMessage(m.from, { 
            text: `💰 Vendiste *${amount}x ${item}* por *${earnings} monedas*.\n📦 Inventario actualizado.\n💵 Saldo actual: *${user.money} monedas*.` 
        }, { quoted: m });
    }
};