import { fileURLToPath } from "url"
import Plugins from "../lib/_plugins.js"
import path from "path"
import fs from "fs"
import { createRequire } from 'module'

global.require = createRequire(import.meta.url)
global.origen = path.dirname(fileURLToPath(import.meta.url))
global._config = {
    owner: {
        number: "51999999999",
        name: "underfined"
    },
    bot: {
        name: "inter rapidisimo",
        credits: "© 2025 - inter rapidisimo 𝓼𝓲𝓮𝓶𝓹𝓻𝓮 𝓡𝓪́𝓹𝓲𝓭𝓸",
        version: "1.0"
    },
    mods: ['51968374620', '51979549311', '573013116003'],
    prefix: ['!', '?', '/', '.', '#'],
    react: {
        setting: '⚙️',
        wait: '⏳',
        global: '✨',
        error: '❌'
    },
}

global.plugins = []
const plugin = new Plugins('plugins')
plugin.readPlugin(plugin.folder)
global.plugins = Object.values(plugin.plugins)
