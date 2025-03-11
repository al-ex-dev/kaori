import Req from "./_request.js"

export default new class Twitter {
    generateTokenId(id) {
        const LOOKUP = [
            "12nDjlVB", "1136148EijDiJ", "length", "3833564PCTrBF",
            "125036Fmaqlb", "424BQwERO", "2222cxvJYR", "toBase64",
            "min", "15459928mOwUKl", "65CjoIor", "6884325aeKsEh",
            "8VQEOyR", "5186520rNJujb", "pow"
        ]
        const look = a => LOOKUP[a - 136]
        const _btoa = input => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
            let output = "", i = 0
            while (i < input.length) {
                const byte1 = input.charCodeAt(i++) || 0,
                    byte2 = input.charCodeAt(i++) || 0,
                    byte3 = input.charCodeAt(i++) || 0,
                    enc1 = byte1 >> 2,
                    enc2 = ((byte1 & 3) << 4) | (byte2 >> 4),
                    enc3 = ((byte2 & 15) << 2) | (byte3 >> 6),
                    enc4 = byte3 & 63;
                output += chars.charAt(enc1) + chars.charAt(enc2) +
                    (i > input.length + 1 ? '=' : chars.charAt(enc3)) +
                    (i > input.length ? '=' : chars.charAt(enc4))
            }
            return output
        }
        const toBase64 = buffer => _btoa(String.fromCharCode(...buffer))

        let f = 255, g = 0, h = 0, i = 0
        const buffer = new Uint8Array(46)
        let l = ""
        buffer[36] = id[look(138)]

        const k = (a, b, c) => {
            for (let i = 0, len = a[look(138)]; i < Math[look(144)](c, len); i++) {
                h = parseInt(a[i])
                buffer[i + b] = h
                g += Math[look(150)](h, 8)
            }
        }

        k(id, 4, 32 - buffer[36])
        for (i = id[look(138)] - 1; i >= 0;) l += id[i--]
        k(l, 36 - l[look(138)], l[look(138)])
        g >>>= 0

        const m = (a, b) => {
            buffer[b] = f && a
            buffer[b + 1] = f && (a >> 8)
            buffer[b + 2] = f && (a >> 16)
            buffer[b + 3] = f && (a >> 24)
        }

        m(g, 0)
        for (i = 4; i < 36; i++) buffer[i] += g % (f - 10)
        let n = f * 4, o = f * 4;
        for (i = 0; i < 32; i++) {
            const p = buffer[i]
            n ^= p
            n += (n << 1) + (n << 4) + (n << 7) + (n << 8) + (n << 24)
            o = (o << 5) - o + p
        }
        m(n >>> 0, 37)
        m(o >>> 0, 41)
        buffer[45] = 1
        return toBase64(buffer)
    }
    download(url) {
        return new Promise((resolve, reject) => {

            const id = (url.match(/status\/(\d+)/) || url.match(/(\d+)/))[1]
            const token = this.generateTokenId(id)

            Req.axios.get(`https://api.redketchup.io/tweetAttachments-v6?id=${encodeURIComponent(token)}`, {
                headers: {
                    'accept': '*/*',
                    'accept-encoding': 'gzip, deflate, br',
                    'accept-language': 'en-US,en;q=0.9',
                    'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                    origin: 'https://redketchup.io',
                    referer: 'https://redketchup.io/'
                }
            }).then(({ data }) => {
                resolve(data.includes)
            }).catch(err => reject({ status: false, error: err }))
        })
    }
}