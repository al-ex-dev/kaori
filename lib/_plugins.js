import fs from "fs"
import path from "path"
import { pathToFileURL } from "url"

export default class Plugins {
    constructor(folderPath = 'plugins') {
        this.pluginFilter = (file) => /\.js$/.test(file)
        this.folder = path.join(origen, folderPath)
        this.plugins = {}
    }
    readPlugin = (folder) => {
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

        fs.readdirSync(folder, { withFileTypes: true }).forEach((result) => {

            const _path = path.join(folder, result.name)
            if (result.isDirectory()) {
                this.readPlugin(_path)
            }
            if (result.isFile()) {
                this.loadPlugin(_path, result.name)
            }
        })
    }

    loadPlugin = async (_path, filename) => {
        if (!this.pluginFilter(filename)) return

        const url = pathToFileURL(_path).href
        const { default: plugin } = await import(url)

        if (plugin) plugins.push({
            name: filename,
            disable: false,
            ...plugin,
            path: _path
        })
    }
}