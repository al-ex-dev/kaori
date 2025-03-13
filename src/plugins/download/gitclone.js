import axios from 'axios';

export default {
    name: 'gitclone',
    params: ['url'],
    desc: 'Clona un repositorio de GitHub',
    comand: ['gitclone'],
    exec: async (m, { sock }) => {
        const url = `https://api.github.com/repos/${m.text.split('/').slice(-2).join('/')}`

        const { full_name, description, stargazers_count, forks_count } = (await axios.get(url)).data

        await sock.sendMessage(m.from, {
            text: `Repositorio: ${full_name}\nDescripción: ${description}\nEstrellas: ${stargazers_count}\nForks: ${forks_count}`
        }, { quoted: m })

        await sock.sendMessage(m.from, {    
            document: {
                url: `${url}/zipball`
            },
            fileName: full_name + '.zip',
            mimetype: 'application/zip'
        }, { quoted: m })
    }
}