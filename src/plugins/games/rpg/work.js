export default {
    name: 'work',
    description: 'Realiza un trabajo y obtén recursos según tu rol en el RPG de Dr. Stone',
    comand: ["work"],
    exec: async (m, { sock, db }) => {
        const user = db.data.users[m.sender]?.games.find(g => g.role);
        if (!user)
            return await sock.sendMessage(m.from, { text: "⚠️ Primero elige un rol con `.role`." }, { quoted: m });

        const cooldown = 5 * 60 * 1000;
        if (user.lastWork && Date.now() - user.lastWork < cooldown)
            return await sock.sendMessage(m.from, { text: "⏳ Debes esperar antes de trabajar de nuevo." }, { quoted: m });

        const jobsByRole = {
            "Científico": [
                { name: "Destilar ácido sulfúrico", reward: { "Ácido Sulfúrico": 5 } },
                { name: "Síntesis de antibióticos", reward: { money: 20 } },
                { name: "Desarrollar pólvora", reward: { "Salitre": 10, "Carbón": 5 } },
                { name: "Analizar muestras de roca", reward: { "Cobre": 3, "Estaño": 2 } },
                { name: "Realizar experimentos", reward: { money: 15 } }
            ],
            "Artesano": [
                { name: "Forjar herramientas", reward: { "Hierro": 10 } },
                { name: "Construir un horno de arcilla", reward: { "Arcilla": 15 } },
                { name: "Mejorar armas primitivas", reward: { "Piedra": 8, "Madera": 5 } },
                { name: "Crear utensilios de cerámica", reward: { "Arcilla": 10, "Madera": 3 } },
                { name: "Elaborar cuerdas y redes", reward: { "Fibra": 8 } }
            ],
            "Recolector": [
                { name: "Buscar hierbas medicinales", reward: { "Hierbas": 10 } },
                { name: "Recolectar minerales raros", reward: { "Cuarzo": 5, "Oro": 2 } },
                { name: "Recoger semillas para cultivos", reward: { "Semillas": 12 } },
                { name: "Recolectar bayas silvestres", reward: { "Bayas": 8 } },
                { name: "Extraer resina de árboles", reward: { "Resina": 7 } }
            ],
            "Cazador": [
                { name: "Atrapar animales pequeños", reward: { "Carne": 8, "Piel": 4 } },
                { name: "Cazar un ciervo", reward: { "Carne": 15, "Huesos": 6 } },
                { name: "Pescar en el río", reward: { "Pescado": 10 } },
                { name: "Cazar aves", reward: { "Carne": 7, "Plumas": 5 } },
                { name: "Pescar en aguas profundas", reward: { "Pescado": 15 } }
            ],
            "Explorador": [
                { name: "Explorar una cueva", reward: { "Cobre": 6, "Estaño": 4 } },
                { name: "Cartografiar un territorio", reward: { money: 10 } },
                { name: "Buscar civilizaciones antiguas", reward: { "Artefactos": 3, "Oro": 5 } },
                { name: "Descubrir ruinas olvidadas", reward: { "Artefactos": 4, money: 8 } },
                { name: "Investigar fuentes termales", reward: { money: 12 } }
            ]
        };

        const jobs = jobsByRole[user.role] || [];
        if (!jobs.length)
            return await sock.sendMessage(m.from, { text: "❌ Tu rol no tiene trabajos asignados aún." }, { quoted: m });

        const job = jobs[Math.floor(Math.random() * jobs.length)];
        user.lastWork = Date.now();

        user.money = user.money || 0
        user.resources = user.resources || {}

        let moneyEarned = 0
        for (const [item, amount] of Object.entries(job.reward)) {
            if (item === "money") {
                user.money += amount
                moneyEarned += amount
            } else {
                user.resources[item] = (user.resources[item] || 0) + amount;
            }
        }

        const rewardsText = Object.entries(job.reward)
            .map(([item, amount]) => `➜ *${item}:* ${amount}`)
            .join('\n');

        await sock.sendMessage(m.from, { 
            text: `🔨 Como *${user.role}*, trabajaste en *${job.name}* y obtuviste:\n\n${rewardsText}\n\n💰 Dinero actual: *${user.money}*\n📦 Inventario actualizado.`
        }, { quoted: m });
    }
};