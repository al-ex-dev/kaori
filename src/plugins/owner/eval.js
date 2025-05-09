import { format } from "util"
import { exec } from 'child_process'
import axios  from 'axios'
import os from 'node:os'
import fs from 'fs'
import path from 'path'
import child from 'child_process'
import util from 'util'

import Scap from '../../scraper/index.js'

import baileys, {
    generateWAMessageFromContent
} from '@nazi-team/baileys'

const { proto } = baileys

export default {
    name: 'eval',
    comand:  /^[_]/i,
    exec: async (m, { sock }) => {
        let evan
        let text = /await|return/gi.test(m.body) ? `(async () => { ${m.body.slice(1)} })()` : `${m.body.slice(1)}`
        try {   
            evan = await eval(text)
        } catch (e) {
            evan = e
        } finally {
            sock.sendMessage(m.from, { text: format(evan) }, { quoted: m })
        }
    },
    isOwner: true
}