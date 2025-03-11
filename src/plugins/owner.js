export default {
    name: "owner",
    description: "Muestra el dueño del bot",
    comand: ["owner", "creador", "dueño", "creator"],
    exec: async (m, { sock } ) => {
        m.reply("Mi creador es Alexito")
    }
}