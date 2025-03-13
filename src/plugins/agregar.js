import fs from 'fs';
import path from 'path';

export default {
    name: 'agregar',
    description: 'Agrega números a la lista de envío',
    comand: ['agregar'],
    exec: async (m, { sock }) => {
        if (!m.text) return await sock.sendMessage(m.from, { text: 'Debes ingresar números separados por coma' })

        const filePath = path.join(global.origen, 'temp.json')

        if (["--clear", "-c"].includes(m.args[0])) {
            fs.writeFileSync(filePath, '[]')
            return await sock.sendMessage(m.from, { text: 'Lista de envío limpiada' })
        }

        if (["--delete", "-d"].includes(m.args[0])) {
            const numbers = m.text.split(',').map(num => num.trim())
            const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : []
            const updated = data.filter(num => !numbers.includes(num))
            fs.writeFileSync(filePath, JSON.stringify(updated))
            return await sock.sendMessage(m.from, { text: `Números eliminados: ${numbers.join(', ')}\nTotal en lista: ${updated.length}` })
        }

        const numbers = m.text.split(',').map(num => num.trim())
        const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : []

        const list = [...data, ...numbers]
        fs.writeFileSync(filePath, JSON.stringify(list))

        await sock.sendMessage(m.from, { text: `Total en lista: ${list.length}\nNúmeros agregados: ${numbers.join(', ')}` })
    }
}