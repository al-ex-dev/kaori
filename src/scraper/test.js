import axios from 'axios'
import crypto from 'crypto'

export class ogmp3 {
    constructor() {
        this.base = "https://api3.apiapi.lat"
        this.endpoints = {
            a: "https://api5.apiapi.lat",
            b: "https://api.apiapi.lat",
            c: "https://api3.apiapi.lat"
        }
        this.default_fmt = { video: '720', audio: '320' }
    }

    hash() {
        return crypto.randomBytes(16).toString("hex")
    }

    encoded(str) {
        return str.split("").map(char => String.fromCharCode(char.charCodeAt(0) ^ 1)).join("")
    }

    enc_url(url, separator = ",") {
        return url.split("").map(c => c.charCodeAt(0)).reverse().join(separator)
    }

    async request(endpoint, data = {}, method = 'post') {
        try {
            const be = Object.values(this.endpoints)[Math.floor(Math.random() * 3)]
            const url = endpoint.startsWith('http') ? endpoint : `${be}${endpoint}`

            const { data: response } = await axios({
                method,
                url,
                data: method === 'post' ? data : undefined,
                headers: {
                    'authority': 'api.apiapi.lat',
                    'content-type': 'application/json',
                    'origin': 'https://ogmp3.lat',
                    'referer': 'https://ogmp3.lat/',
                    'user-agent': 'Postify/1.0.0'
                }
            })
            return { status: true, code: 200, data: response }
        } catch (error) {
            return { status: false, code: error.response?.status || 500, error: error.message }
        }
    }

    async checkProgress(data) {
        let attempts = 0, maxAttempts = 300

        while (attempts++ < maxAttempts) {
            const res = await this.request(`/${this.hash()}/status/${this.encoded(data.i)}/${this.hash()}/`, { data: data.i })
            if (!res.status) {
                await new Promise(r => setTimeout(r, 2000))
                continue
            }

            if (res.data.s === "C") return res.data
            if (res.data.s === "P") await new Promise(r => setTimeout(r, 2000))
        }

        return null
    }

    async download(link, format, type = 'video') {
        let retries = 0, maxRetries = 20

        while (retries++ < maxRetries) {
            const req = {
                data: this.encoded(link),
                format: type === 'audio' ? "0" : "1",
                referer: "https://ogmp3.cc",
                mp3Quality: type === 'audio' ? format : null,
                mp4Quality: type === 'video' ? format : null,
                userTimeZone: new Date().getTimezoneOffset().toString()
            }

            const resx = await this.request(`/${this.hash()}/init/${this.enc_url(link)}/${this.hash()}/`, req)

            if (!resx.status) continue
            if (!resx.data || resx.data.le || resx.data.i === "blacklisted" || resx.data.e || resx.data.i === "invalid") return null
            if (resx.data.s === "C") return `${this.base}/${this.hash()}/download/${this.encoded(resx.data.i)}/${this.hash()}/`

            const prod = await this.checkProgress(resx.data)
            if (prod?.s === "C") return `${this.base}/${this.hash()}/download/${this.encoded(prod.i)}/${this.hash()}/`
        }

        return null
    }
}

export class YT {
    constructor() {
        this._s = null
        this._t = null
        this.baseUrl = 'https://ytdownloader.nvlgroup.my.id'
    }

    async _sig() {
        const res = await axios.get(`${this.baseUrl}/generate-signature`)
        this._s = res.data.signature
        this._t = res.data.timestamp
        return res.data
    }

    async _checkSignature() {
        if (!this._s || !this._t || Date.now() - this._t > 4 * 60 * 1000) {
            await this._sig();
        }
    }

    async download(url, type, resolution) {
        await this._checkSignature()

        const { data } = await axios.get(`${this.baseUrl}/web/info?url=${encodeURIComponent(url)}`,
            {
                headers: {
                    'x-server-signature': this._s,
                    'x-signature-timestamp': this._t
                }
            }
        )

        console.log(data)

        if (type === "video") {
            const video = data.resolutions.find(item => item.height === resolution)
            if (!video) throw new Error("Resolution not available");

            return {
                type: "video",
                url: `${this.baseUrl}/web/download?url=${url}&resolution=${video.height}&signature=${this._s}&timestamp=${this._t}`
            }
        }

        if (type === "audio") {
            const audio = data.audioBitrates.find(item => item.bitrate === resolution);
            if (!audio) throw new Error("Bitrate not available");

            return {
                type: "audio",
                url: `${this.baseUrl}/web/audio?url=${url}&bitrate=${audio.bitrate}&signature=${this._s}&timestamp=${this._t}`
            }
        }

        throw new Error("Invalid type. Use 'video' or 'audio'.")
    }
}

const yt = new YT()
const t = await yt.download("https://www.youtube.com/watch?v=ACwAviLRn_g", "video", 256)
console.log(t)

const test = await axios.get(t.url, {
    responseType: 'arraybuffer',
    headers: {
      'x-server-signature': yt._s,
      'x-signature-timestamp': yt._t
    }
  });
console.log(test.data)
